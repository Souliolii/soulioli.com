const topicForm = document.querySelector('#topic-form');
const replyForm = document.querySelector('#reply-form');
const topicFeedback = document.querySelector('#topic-feedback');
const replyFeedback = document.querySelector('#reply-feedback');
const topicSelect = document.querySelector('#reply-topic-id');
const adminTopicList = document.querySelector('#admin-topic-list');
const adminTopicCount = document.querySelector('#admin-topic-count');

let adminTopics = [];

const showFeedback = (target, message, type = 'success') => {
  target.textContent = message;
  target.className = `feedback ${type}`;
};

const escapeHtml = (value) => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const formatTopicOption = (topic) => {
  const replyCount = topic.replyCount || 0;
  const suffix = replyCount === 1 ? '1 post' : `${replyCount} posts`;
  return `${topic.title} — ${suffix}`;
};

const renderAdminTopics = () => {
  if (!topicSelect || !adminTopicList || !adminTopicCount) {
    return;
  }

  adminTopicCount.textContent = `${adminTopics.length} topic${adminTopics.length === 1 ? '' : 's'}`;

  topicSelect.innerHTML = adminTopics.length
    ? adminTopics.map((topic) => `<option value="${escapeHtml(topic.id)}">${escapeHtml(formatTopicOption(topic))}</option>`).join('')
    : '<option value="">No topics available</option>';

  adminTopicList.innerHTML = adminTopics.length
    ? adminTopics.map((topic) => `
      <a class="admin-topic-row" href="/forum/topic/${encodeURIComponent(topic.id)}">
        <div>
          <strong>${escapeHtml(topic.title)}</strong>
          <p>${escapeHtml(topic.excerpt || 'No preview available.')}</p>
        </div>
        <span>${topic.replyCount || 0} posts</span>
      </a>
    `).join('')
    : '<div class="empty-state">No topics yet.</div>';
};

const loadTopics = async () => {
  try {
    const response = await fetch('/api/forum');
    if (!response.ok) {
      throw new Error('Unable to load topics.');
    }

    const data = await response.json();
    adminTopics = Array.isArray(data.threads) ? data.threads : [];
    renderAdminTopics();
  } catch (error) {
    if (adminTopicList) {
      adminTopicList.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
    }
  }
};

const handleTopicSubmit = async (event) => {
  event.preventDefault();
  showFeedback(topicFeedback, 'Publishing...', 'loading');

  const title = document.querySelector('#topic-title-input').value.trim();
  const postTitle = document.querySelector('#topic-post-title-input').value.trim();
  const body = document.querySelector('#topic-body-input').value.trim();
  const tags = document.querySelector('#topic-tags-input').value.trim();

  try {
    const response = await fetch('/api/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, postTitle, body, tags }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to create topic.');
    }

    topicForm.reset();
    showFeedback(topicFeedback, `Topic created. Open /forum/topic/${data.thread.id}`, 'success');
    await loadTopics();
    topicSelect.value = data.thread.id;
  } catch (error) {
    showFeedback(topicFeedback, error.message, 'error');
  }
};

const handleReplySubmit = async (event) => {
  event.preventDefault();
  showFeedback(replyFeedback, 'Posting...', 'loading');

  const topicId = document.querySelector('#reply-topic-id').value.trim();
  const title = document.querySelector('#reply-title-input').value.trim();
  const body = document.querySelector('#reply-body-input').value.trim();

  try {
    const response = await fetch(`/api/forum/${encodeURIComponent(topicId)}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to add post.');
    }

    replyForm.reset();
    showFeedback(replyFeedback, 'Post added.', 'success');
    await loadTopics();
  } catch (error) {
    showFeedback(replyFeedback, error.message, 'error');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  topicForm.addEventListener('submit', handleTopicSubmit);
  replyForm.addEventListener('submit', handleReplySubmit);
  loadTopics();
});