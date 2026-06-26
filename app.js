const uploadForm = document.querySelector('#upload-form');
const fileList = document.querySelector('#file-list');
const feedback = document.querySelector('#upload-feedback');

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`;
};

const showFeedback = (message, type = 'success') => {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
};

const renderFileCard = (file) => {
  const downloadUrl = `/uploads/${encodeURIComponent(file.filename)}`;
  return `
    <article class="file-card">
      <div class="file-card-body">
        <div class="file-card-title">${file.title}</div>
        <div class="file-card-meta">
          <span>${new Date(file.uploadedAt).toLocaleString()}</span>
          <span>${formatBytes(file.size)}</span>
        </div>
        <p>${file.description || 'No description provided.'}</p>
      </div>
      <div class="file-card-actions">
        <a class="download-button" href="${downloadUrl}" download="${encodeURIComponent(file.originalName)}">Download</a>
      </div>
    </article>
  `;
};

const loadFiles = async () => {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) {
      throw new Error('Unable to fetch files.');
    }

    const data = await response.json();
    const files = Array.isArray(data.files) ? data.files : [];

    if (files.length === 0) {
      fileList.innerHTML = '<div class="empty-state">No files uploaded yet.</div>';
      return;
    }

    fileList.innerHTML = files.map(renderFileCard).join('');
  } catch (error) {
    fileList.innerHTML = `<div class="error-state">${error.message}</div>`;
  }
};

const handleUpload = async (event) => {
  event.preventDefault();
  showFeedback('Uploading…', 'loading');

  const formData = new FormData(uploadForm);
  const file = uploadForm.querySelector('input[name="file"]').files[0];
  if (!file) {
    showFeedback('Please select a file before uploading.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed.');
    }

    showFeedback('Upload complete. The file is now available below.', 'success');
    uploadForm.reset();
    loadFiles();
  } catch (error) {
    showFeedback(error.message, 'error');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  if (!uploadForm || !fileList) return;
  uploadForm.addEventListener('submit', handleUpload);
  loadFiles();
});
