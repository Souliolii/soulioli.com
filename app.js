const uploadForm = document.querySelector('#upload-form');
const fileList = document.querySelector('#file-list');
const feedback = document.querySelector('#upload-feedback');
const searchInput = document.querySelector('#search-input');

let allFiles = [];

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
        <div class="file-card-category">${file.category || 'Uncategorized'}</div>
        <div class="file-card-meta">
          <span>${new Date(file.uploadedAt).toLocaleString()}</span>
          <span>${formatBytes(file.size)}</span>
        </div>
        <p>${file.description || 'No description provided.'}</p>
      </div>
      <div class="file-card-actions">
        <a class="download-button" href="${downloadUrl}" download="${encodeURIComponent(file.originalName)}">Download</a>
        <button class="delete-button" data-id="${file.id}" type="button">Delete</button>
      </div>
    </article>
  `;
};

const groupFilesByCategory = (files) => {
  const grouped = {};
  files.forEach((file) => {
    const category = file.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(file);
  });
  return grouped;
};

const renderCategorizedFiles = (files) => {
  if (files.length === 0) {
    return '<div class="empty-state">No files found.</div>';
  }

  const grouped = groupFilesByCategory(files);
  const categories = Object.keys(grouped).sort();

  return categories
    .map((category) => {
      const categoryFiles = grouped[category];
      return `
        <div class="category-group">
          <div class="category-header">${category}</div>
          <div class="category-files">
            ${categoryFiles.map(renderFileCard).join('')}
          </div>
        </div>
      `;
    })
    .join('');
};

const loadFiles = async () => {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) {
      throw new Error('Unable to fetch files.');
    }

    const data = await response.json();
    allFiles = Array.isArray(data.files) ? data.files : [];
    renderFiles(allFiles);
  } catch (error) {
    fileList.innerHTML = `<div class="error-state">${error.message}</div>`;
  }
};

const renderFiles = (files) => {
  fileList.innerHTML = renderCategorizedFiles(files);

  fileList.querySelectorAll('.delete-button').forEach((btn) => {
    btn.addEventListener('click', handleDelete);
  });
};

const filterFiles = () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) {
    renderFiles(allFiles);
    return;
  }

  const filtered = allFiles.filter((file) => {
    const titleMatch = file.title.toLowerCase().includes(query);
    const descMatch = file.description.toLowerCase().includes(query);
    const categoryMatch = (file.category || 'Uncategorized').toLowerCase().includes(query);
    return titleMatch || descMatch || categoryMatch;
  });

  renderFiles(filtered);
};

const handleDelete = async (event) => {
  const fileId = event.target.dataset.id;
  const fileRecord = allFiles.find((f) => f.id === fileId);

  if (!fileRecord) return;

  const confirmed = confirm(`Delete "${fileRecord.title}"? This cannot be undone.`);
  if (!confirmed) return;

  const password = prompt('Enter the delete password:');
  if (password === null) return;

  try {
    event.target.disabled = true;
    event.target.textContent = 'Deleting...';

    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Delete failed.');
    }

    allFiles = allFiles.filter((f) => f.id !== fileId);
    filterFiles();
    showFeedback(`"${fileRecord.title}" has been deleted.`, 'success');
  } catch (error) {
    showFeedback(error.message, 'error');
    event.target.disabled = false;
    event.target.textContent = 'Delete';
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
  searchInput.addEventListener('input', filterFiles);
  loadFiles();
});

