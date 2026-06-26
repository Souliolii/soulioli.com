const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');
const metadataPath = path.join(uploadsDir, 'metadata.json');
const forumPath = path.join(uploadsDir, 'forum.json');
const deletePassword = process.env.DELETE_PASSWORD || 'delete123';
const uploadPassword = process.env.UPLOAD_PASSWORD || 'upload123';
const forumAdminPassword = process.env.FORUM_ADMIN_PASSWORD || 'forumadmin';

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._\- ]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const ensureStorage = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
  try {
    await fs.access(metadataPath);
  } catch {
    await fs.writeFile(metadataPath, '[]', 'utf8');
  }
  try {
    await fs.access(forumPath);
  } catch {
    await fs.writeFile(forumPath, '[]', 'utf8');
  }
};

const readMetadata = async () => {
  const raw = await fs.readFile(metadataPath, 'utf8');
  return JSON.parse(raw || '[]');
};

const writeMetadata = async (data) => {
  await fs.writeFile(metadataPath, JSON.stringify(data, null, 2), 'utf8');
};

const readForum = async () => {
  const raw = await fs.readFile(forumPath, 'utf8');
  return JSON.parse(raw || '[]');
};

const writeForum = async (data) => {
  await fs.writeFile(forumPath, JSON.stringify(data, null, 2), 'utf8');
};

const normalizeForumPost = (post, fallbackTitle = 'Untitled post') => {
  const createdAt = post.createdAt || new Date().toISOString();
  return {
    id: post.id || `${Date.now()}-post`,
    title: String(post.title || fallbackTitle || 'Untitled post').trim() || 'Untitled post',
    body: String(post.body || '').trim(),
    author: String(post.author || 'Soulioli').trim() || 'Soulioli',
    createdAt,
  };
};

const normalizeForumThread = (thread) => {
  const createdAt = thread.createdAt || new Date().toISOString();
  const posts = Array.isArray(thread.posts) && thread.posts.length
    ? thread.posts.map((post, index) => normalizeForumPost(post, index === 0 ? thread.title : `Reply ${index}`))
    : thread.body
      ? [normalizeForumPost({ body: thread.body, createdAt }, thread.title)]
      : [];

  return {
    id: thread.id || `${Date.now()}`,
    title: String(thread.title || 'Untitled topic').trim() || 'Untitled topic',
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    createdAt,
    updatedAt: thread.updatedAt || createdAt,
    posts,
  };
};

const parseBasicAuthPassword = (header) => {
  if (!header || !header.startsWith('Basic ')) {
    return null;
  }

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) {
      return null;
    }

    return decoded.slice(separatorIndex + 1);
  } catch {
    return null;
  }
};

const requireForumAdmin = (req, res, next) => {
  const password = parseBasicAuthPassword(req.headers.authorization);
  if (password !== forumAdminPassword) {
    res.set('WWW-Authenticate', 'Basic realm="Forum Admin"');
    return res.status(401).send('Authentication required.');
  }

  return next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/files', async (req, res) => {
  try {
    const files = await readMetadata();
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Unable to read file list.' });
  }
});

app.get('/api/forum', async (req, res) => {
  try {
    const threads = (await readForum()).map(normalizeForumThread).map((thread) => ({
      id: thread.id,
      title: thread.title,
      tags: thread.tags,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      replyCount: thread.posts.length > 0 ? thread.posts.length - 1 : 0,
      excerpt: thread.posts[0]?.body || '',
      latestPostTitle: thread.posts[thread.posts.length - 1]?.title || '',
      postTitles: thread.posts.map((post) => post.title),
    }));

    threads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: 'Unable to read forum threads.' });
  }
});

app.get('/api/forum/:id', async (req, res) => {
  try {
    const threads = (await readForum()).map(normalizeForumThread);
    const thread = threads.find((item) => item.id === req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found.' });
    }
    res.json({ thread });
  } catch (error) {
    res.status(500).json({ error: 'Unable to read forum thread.' });
  }
});

app.post('/api/forum', requireForumAdmin, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const postTitle = String(req.body.postTitle || '').trim();
    const body = String(req.body.body || '').trim();
    const tags = String(req.body.tags || '').trim();

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }

    const threads = await readForum();
    const thread = {
      id: `${Date.now()}`,
      title,
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      posts: [{
        id: `${Date.now()}-post-1`,
        title: postTitle || title,
        body,
        author: 'Soulioli',
        createdAt: new Date().toISOString(),
      }],
    };

    threads.unshift(thread);
    await writeForum(threads);
    res.json({ thread });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create forum thread.' });
  }
});

app.post('/api/forum/:id/posts', requireForumAdmin, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();

    if (!body) {
      return res.status(400).json({ error: 'Post body is required.' });
    }

    const threads = (await readForum()).map(normalizeForumThread);
    const thread = threads.find((item) => item.id === req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found.' });
    }

    const post = {
      id: `${Date.now()}-post-${thread.posts.length + 1}`,
      title: title || `Reply ${thread.posts.length + 1}`,
      body,
      author: 'Soulioli',
      createdAt: new Date().toISOString(),
    };

    thread.posts.push(post);
    thread.updatedAt = post.createdAt;
    await writeForum(threads);
    res.json({ post, thread });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to add forum post.' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const providedPassword = String(req.body.uploadPassword || '');
    if (providedPassword !== uploadPassword) {
      return res.status(403).json({ error: 'Incorrect upload password.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const title = String(req.body.title || req.file.originalname).trim();
    const description = String(req.body.description || '').trim();
    const category = String(req.body.category || 'Uncategorized').trim();
    const downloadable = String(req.body.downloadable || 'false') === 'true';
    const metadata = await readMetadata();

    const fileRecord = {
      id: `${Date.now()}`,
      title: title || req.file.originalname,
      description,
      category: category || 'Uncategorized',
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      downloadable,
    };

    metadata.unshift(fileRecord);
    await writeMetadata(metadata);

    res.json({ file: fileRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const providedPassword = req.body.password || '';
    
    if (providedPassword !== deletePassword) {
      return res.status(403).json({ error: 'Incorrect password. File not deleted.' });
    }

    const fileId = req.params.id;
    const metadata = await readMetadata();
    const fileToDelete = metadata.find((f) => f.id === fileId);

    if (!fileToDelete) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const filePath = path.join(uploadsDir, fileToDelete.filename);
    await fs.unlink(filePath);

    const updatedMetadata = metadata.filter((f) => f.id !== fileId);
    await writeMetadata(updatedMetadata);

    res.json({ success: true, message: 'File deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Delete failed.' });
  }
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/landing.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.css'));
});

app.get('/forum.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'forum.css'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/forum.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'forum.js'));
});

app.get('/forum-topic.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'forum-topic.js'));
});

app.get('/forum-admin.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'forum-admin.js'));
});

app.get('/forum', (req, res) => {
  res.sendFile(path.join(__dirname, 'forum.html'));
});

app.get('/forum/topic/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'forum-topic.html'));
});

app.get('/forum/admin', requireForumAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'forum-admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/share', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`Document Share server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Startup failed', error);
    process.exit(1);
  });
