let allTopics = [];
window.__forumIndexBooted = false;

const escapeHtml = (value) => {
  return String(value).replaceAll('&', '&amp;')
                      .replaceAll('<', '&lt;')
                      .replaceAll('>', '&gt;')
                      .replaceAll('"', '&quot;')
                      .replaceAll("'", '&#39;');
};

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const renderTopic = (topic, index) => {
  const tags = (topic.tags || []).slice(0, 4).map((tag) => `<span class="topic-tag">${escapeHtml(tag)}</span>`).join('');
  return `
    <a class="topic-card" href="/forum/topic/${encodeURIComponent(topic.id)}">
      <div class="topic-card-number">${String(index + 1).padStart(2, '0')}</div>
      <div class="topic-card-body">
        <div class="topic-card-topline">
          <span>${topic.replyCount || 0} replies</span>
          <span>${formatDate(topic.updatedAt || topic.createdAt)}</span>
        </div>
        <h3>${escapeHtml(topic.title)}</h3>
        <p>${escapeHtml(topic.excerpt || 'No preview available.')}</p>
        <div class="topic-mini-meta">${escapeHtml(topic.latestPostTitle || 'Opening post')}</div>
        <div class="topic-tag-row">${tags}</div>
      </div>
    </a>
  `;
};

const loadTopics = async () => {
  const response = await fetch('/api/forum');
  if (!response.ok) {
    throw new Error('Unable to load topics.');
  }

  const data = await response.json();
  allTopics = Array.isArray(data.threads) ? data.threads : [];
};

const initForum = () => {
  window.__forumIndexBooted = true;
  const forumSearch = document.querySelector('#forum-search');
  const topicList = document.querySelector('#topic-list');
  const topicCount = document.querySelector('#topic-count');

  if (!topicList || !topicCount) {
    return;
  }

  const renderTopics = (topics) => {
    topicCount.textContent = `${topics.length} topic${topics.length === 1 ? '' : 's'}`;
    if (!topics.length) {
      topicList.innerHTML = '<div class="empty-state">No topics found.</div>';
      return;
    }

    topicList.innerHTML = topics.map(renderTopic).join('');
  };

  const filterTopics = () => {
    const query = forumSearch ? forumSearch.value.toLowerCase().trim() : '';
    if (!query) {
      renderTopics(allTopics);
      return;
    }

    const filtered = allTopics.filter((topic) => {
      const haystack = [topic.title, topic.excerpt, topic.latestPostTitle, ...(topic.postTitles || []), ...(topic.tags || [])].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    renderTopics(filtered);
  };

  if (forumSearch) {
    forumSearch.addEventListener('input', filterTopics);
  }

  loadTopics()
    .then(() => renderTopics(allTopics))
    .catch((error) => {
      topicList.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
    });
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initForum);
} else {
  initForum();
}

const loadTopics = async () => {
  try {
    const response = await fetch('/api/forum');
    if (!response.ok) {
      throw new Error('Unable to load topics.');
  }

  try {
    showForumFeedback(error.message, 'error');
  const forumSearch = document.querySelector('#forum-search');
  const topicList = document.querySelector('#topic-list');
  const topicCount = document.querySelector('#topic-count');

  if (!topicList || !topicCount) {
    return;
  }

  const renderTopicsSafe = (topics) => {
    topicCount.textContent = `${topics.length} topic${topics.length === 1 ? '' : 's'}`;
    if (!topics.length) {
      topicList.innerHTML = '<div class="empty-state">No topics found.</div>';
      return;
    }
    topicList.innerHTML = topics.map(renderTopic).join('');
  };

  const filterTopics = () => {
    const query = forumSearch ? forumSearch.value.toLowerCase().trim() : '';
    if (!query) {
      renderTopicsSafe(allTopics);
      return;
    }

    const filtered = allTopics.filter((topic) => {
      const haystack = [topic.title, topic.excerpt, topic.latestPostTitle, ...(topic.postTitles || []), ...(topic.tags || [])].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    renderTopicsSafe(filtered);
  };

  if (forumSearch) {
    forumSearch.addEventListener('input', filterTopics);
  }

  loadTopics().then(() => renderTopicsSafe(allTopics));
window.addEventListener('DOMContentLoaded', () => {
  if (!forumForm || !threadList) return;
  forumForm.addEventListener('submit', handleForumSubmit);
  forumSearch.addEventListener('input', filterThreads);
  loadThreads();
});
