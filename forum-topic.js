const topicTitle = document.querySelector('#topic-title');
const topicSummary = document.querySelector('#topic-summary');
const topicMeta = document.querySelector('#topic-meta');
const topicTags = document.querySelector('#topic-tags');
const topicBody = document.querySelector('#topic-body');
const topicPosts = document.querySelector('#topic-posts');

const escapeHtml = (value) => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const formatDate = (value) => new Date(value).toLocaleString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const getTopicId = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1];
};

const renderPost = (post, index) => `
  <article class="post-card">
    <div class="post-number">${String(index + 1).padStart(2, '0')}</div>
    <div class="post-copy">
      <div class="post-meta">
        <span>${escapeHtml(post.author || 'Soulioli')}</span>
        <span>${formatDate(post.createdAt)}</span>
      </div>
      <h3 class="post-title">${escapeHtml(post.title || `Post ${index + 1}`)}</h3>
      <p>${escapeHtml(post.body)}</p>
    </div>
  </article>
`;

const loadTopic = async () => {
  const topicId = getTopicId();
  try {
    const response = await fetch(`/api/forum/${encodeURIComponent(topicId)}`);
    if (!response.ok) {
      throw new Error('Topic not found.');
    }

    const data = await response.json();
    const topic = data.thread;
    const posts = Array.isArray(topic.posts) ? topic.posts : [];

    topicTitle.textContent = topic.title;
    topicSummary.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'} in this thread. Search also checks post titles.`;
    topicMeta.textContent = `Started ${formatDate(topic.createdAt)}`;
    topicTags.textContent = (topic.tags || []).length ? topic.tags.join(' · ') : 'No tags';
    topicBody.innerHTML = posts[0]
      ? `<div class="topic-opener"><h2>${escapeHtml(posts[0].title || 'Opening post')}</h2><p>${escapeHtml(posts[0].body || '')}</p></div>`
      : '<div class="empty-state">No opening post yet.</div>';
    topicPosts.innerHTML = posts.length
      ? posts.map(renderPost).join('')
      : '<div class="empty-state">No posts yet.</div>';
  } catch (error) {
    topicTitle.textContent = 'Topic unavailable';
    topicSummary.textContent = error.message;
    topicBody.innerHTML = '<div class="error-state">Unable to load this topic.</div>';
    topicPosts.innerHTML = '';
  }
};

window.addEventListener('DOMContentLoaded', loadTopic);