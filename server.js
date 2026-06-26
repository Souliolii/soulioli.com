const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');
const metadataPath = path.join(uploadsDir, 'metadata.json');

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
};

const readMetadata = async () => {
  const raw = await fs.readFile(metadataPath, 'utf8');
  return JSON.parse(raw || '[]');
};

const writeMetadata = async (data) => {
  await fs.writeFile(metadataPath, JSON.stringify(data, null, 2), 'utf8');
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

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const title = String(req.body.title || req.file.originalname).trim();
    const description = String(req.body.description || '').trim();
    const metadata = await readMetadata();

    const fileRecord = {
      id: `${Date.now()}`,
      title: title || req.file.originalname,
      description,
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };

    metadata.unshift(fileRecord);
    await writeMetadata(metadata);

    res.json({ file: fileRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/', (req, res) => {
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
