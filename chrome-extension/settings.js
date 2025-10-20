// JobBot Settings Page Controller

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();

  // Event listeners
  document.getElementById('save-button').addEventListener('click', saveSettings);
  document.getElementById('test-button').addEventListener('click', testConfiguration);
  document.getElementById('resume-upload-area').addEventListener('click', () => {
    document.getElementById('resume-file').click();
  });
  document.getElementById('resume-file').addEventListener('change', handleResumeUpload);
});

async function loadSettings() {
  const data = await chrome.storage.local.get(null);

  if (data.user_profile) {
    document.getElementById('full_name').value = data.user_profile.full_name || '';
    document.getElementById('email').value = data.user_profile.email || '';
    document.getElementById('phone').value = data.user_profile.phone || '';
    document.getElementById('years_of_experience').value = data.user_profile.years_of_experience || '';
    document.getElementById('salary_expectation').value = data.user_profile.salary_expectation || '';
    document.getElementById('work_authorized').checked = data.user_profile.work_authorized !== false;
    document.getElementById('willing_to_relocate').checked = data.user_profile.willing_to_relocate || false;
    document.getElementById('cover_letter_template').value = data.user_profile.cover_letter_template || '';

    // Load resume list
    renderResumeList(data.user_profile.resumes || []);
  }

  document.getElementById('daily_limit').value = data.daily_limit || 15;
  document.getElementById('preview_mode').checked = data.preview_mode !== false;
  document.getElementById('backend_url').value = data.backend_url || '';
}

async function saveSettings() {
  const button = document.getElementById('save-button');
  button.textContent = 'Saving...';
  button.disabled = true;

  try {
    const currentData = await chrome.storage.local.get('user_profile');
    const userProfile = currentData.user_profile || {};

    userProfile.full_name = document.getElementById('full_name').value;
    userProfile.email = document.getElementById('email').value;
    userProfile.phone = document.getElementById('phone').value;
    userProfile.years_of_experience = document.getElementById('years_of_experience').value;
    userProfile.salary_expectation = document.getElementById('salary_expectation').value;
    userProfile.work_authorized = document.getElementById('work_authorized').checked;
    userProfile.willing_to_relocate = document.getElementById('willing_to_relocate').checked;
    userProfile.cover_letter_template = document.getElementById('cover_letter_template').value;

    await chrome.storage.local.set({
      user_profile: userProfile,
      daily_limit: parseInt(document.getElementById('daily_limit').value),
      preview_mode: document.getElementById('preview_mode').checked,
      backend_url: document.getElementById('backend_url').value
    });

    showSuccess();
  } catch (error) {
    alert('Error saving settings: ' + error.message);
  } finally {
    button.textContent = 'Save Settings';
    button.disabled = false;
  }
}

async function handleResumeUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a PDF, DOC, or DOCX file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('File must be less than 5MB');
    return;
  }

  // Read file as base64
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];

    const currentData = await chrome.storage.local.get('user_profile');
    const userProfile = currentData.user_profile || {};
    const resumes = userProfile.resumes || [];

    // Generate unique ID for resume
    const resumeId = 'resume_' + Date.now();

    // Create new resume object
    const newResume = {
      id: resumeId,
      name: file.name,
      type: file.type,
      size: file.size,
      content: base64,
      isDefault: resumes.length === 0, // First resume is default
      uploadedAt: new Date().toISOString()
    };

    resumes.push(newResume);
    userProfile.resumes = resumes;

    await chrome.storage.local.set({ user_profile: userProfile });
    renderResumeList(resumes);
    showSuccess();

    // Reset file input
    event.target.value = '';
  };

  reader.readAsDataURL(file);
}

function renderResumeList(resumes) {
  const listContainer = document.getElementById('resume-list');

  if (!resumes || resumes.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p>No resumes uploaded yet</p>
        <p style="margin-top: 4px; font-size: 12px;">Upload your first resume to get started</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = resumes.map(resume => `
    <div class="resume-item ${resume.isDefault ? 'default' : ''}" data-resume-id="${resume.id}">
      <div class="resume-info">
        <span class="resume-icon">📄</span>
        <div class="resume-details">
          <div class="resume-name">${resume.name}</div>
          <div class="resume-meta">${formatFileSize(resume.size)} • Uploaded ${formatDate(resume.uploadedAt)}</div>
        </div>
        ${resume.isDefault ? '<span class="resume-badge">DEFAULT</span>' : ''}
      </div>
      <div class="resume-actions">
        ${!resume.isDefault ? `<button class="icon-button" onclick="setDefaultResume('${resume.id}')">Set as Default</button>` : ''}
        <button class="icon-button danger" onclick="deleteResume('${resume.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function setDefaultResume(resumeId) {
  const currentData = await chrome.storage.local.get('user_profile');
  const userProfile = currentData.user_profile || {};
  const resumes = userProfile.resumes || [];

  // Update default status
  resumes.forEach(resume => {
    resume.isDefault = resume.id === resumeId;
  });

  userProfile.resumes = resumes;
  await chrome.storage.local.set({ user_profile: userProfile });
  renderResumeList(resumes);
  showSuccess();
}

async function deleteResume(resumeId) {
  if (!confirm('Are you sure you want to delete this resume?')) {
    return;
  }

  const currentData = await chrome.storage.local.get('user_profile');
  const userProfile = currentData.user_profile || {};
  let resumes = userProfile.resumes || [];

  const deletingDefault = resumes.find(r => r.id === resumeId)?.isDefault;

  // Remove resume
  resumes = resumes.filter(resume => resume.id !== resumeId);

  // If we deleted the default and there are other resumes, make the first one default
  if (deletingDefault && resumes.length > 0) {
    resumes[0].isDefault = true;
  }

  userProfile.resumes = resumes;
  await chrome.storage.local.set({ user_profile: userProfile });
  renderResumeList(resumes);
  showSuccess();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Make functions available globally for onclick handlers
window.setDefaultResume = setDefaultResume;
window.deleteResume = deleteResume;

function showSuccess() {
  const message = document.getElementById('success-message');
  message.classList.add('show');
  setTimeout(() => {
    message.classList.remove('show');
  }, 3000);
}

async function testConfiguration() {
  const button = document.getElementById('test-button');
  button.textContent = 'Testing...';
  button.disabled = true;

  try {
    const data = await chrome.storage.local.get('user_profile');

    if (!data.user_profile || !data.user_profile.full_name) {
      alert('❌ Please fill in your name');
      return;
    }

    if (!data.user_profile.email) {
      alert('❌ Please fill in your email');
      return;
    }

    const resumes = data.user_profile.resumes || [];
    if (resumes.length === 0) {
      alert('❌ Please upload at least one resume');
      return;
    }

    const defaultResume = resumes.find(r => r.isDefault);
    if (!defaultResume) {
      alert('❌ Please set a default resume');
      return;
    }

    alert(`✓ Configuration looks good! You have ${resumes.length} resume(s) uploaded and are ready to start applying to jobs.`);
  } finally {
    button.textContent = 'Test Configuration';
    button.disabled = false;
  }
}
