// JobBot Chrome Extension - Popup UI Controller

document.addEventListener('DOMContentLoaded', async () => {
  // Load settings and stats
  await loadStats();

  // Check if we're on a job page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isJobPage = await checkIfJobPage(tab.url);

  if (isJobPage) {
    showJobView();
    await loadJobInfo(tab.id);
  } else {
    showNoJobView();
  }

  // Event listeners
  document.getElementById('apply-button')?.addEventListener('click', handleApply);
  document.getElementById('preview-button')?.addEventListener('click', handlePreview);
  document.getElementById('open-dashboard')?.addEventListener('click', openDashboard);
  document.getElementById('settings-link')?.addEventListener('click', openSettings);
});

async function checkIfJobPage(url) {
  if (!url) return false;

  const jobPatterns = [
    /linkedin\.com\/jobs\/view/,
    /indeed\.com\/viewjob/,
    /greenhouse\.io/,
    /lever\.co/
  ];

  return jobPatterns.some(pattern => pattern.test(url));
}

function showJobView() {
  document.getElementById('no-job-view').classList.add('hidden');
  document.getElementById('job-view').classList.remove('hidden');
}

function showNoJobView() {
  document.getElementById('job-view').classList.add('hidden');
  document.getElementById('no-job-view').classList.remove('hidden');
}

async function loadStats() {
  const stats = await chrome.storage.local.get(['applications_today', 'daily_limit', 'total_applications']);

  const applicationsToday = stats.applications_today || 0;
  const dailyLimit = stats.daily_limit || 15;
  const totalApplications = stats.total_applications || 0;
  const remaining = Math.max(0, dailyLimit - applicationsToday);

  // Update all stat displays
  const todayElements = document.querySelectorAll('[id^="stat-today"], [id^="job-stat-today"]');
  const limitElements = document.querySelectorAll('[id^="stat-limit"], [id^="job-stat-limit"]');
  const totalElements = document.querySelectorAll('[id="stat-total"]');
  const remainingElements = document.querySelectorAll('[id="job-stat-remaining"]');

  todayElements.forEach(el => el.textContent = applicationsToday);
  limitElements.forEach(el => el.textContent = dailyLimit);
  totalElements.forEach(el => el.textContent = totalApplications);
  remainingElements.forEach(el => el.textContent = remaining);
}

async function loadJobInfo(tabId) {
  try {
    // Inject content script if not already injected
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-scripts/common.js']
    });

    // Get job info from content script
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getJobInfo' });

    if (response && response.job) {
      document.getElementById('job-title').textContent = response.job.title || 'Job Title';
      document.getElementById('job-company').textContent = response.job.company || 'Company Name';
      document.getElementById('match-score').textContent = `Match: ${response.job.matchScore || '--'}%`;

      // Load resume selector
      await loadResumeSelector();

      // Update status
      if (response.canApply) {
        document.getElementById('status-badge').textContent = 'Ready to Apply';
        document.getElementById('status-badge').className = 'status-badge badge-ready';
        document.getElementById('apply-button').disabled = false;
      } else {
        document.getElementById('status-badge').textContent = response.reason || 'Cannot Apply';
        document.getElementById('status-badge').className = 'status-badge badge-not-ready';
        document.getElementById('apply-button').disabled = true;
      }

      // Update checklist
      updateChecklistItem('resume-status', response.hasResume, 'Resume ready', 'No resume uploaded');
      updateChecklistItem('cover-letter-status', response.hasCoverLetter, 'Cover letter generated', 'Cover letter pending');
      updateChecklistItem('fields-status', response.fieldsDetected > 0, `${response.fieldsDetected || 0} fields detected`, 'No fields detected');
    }
  } catch (error) {
    console.error('Error loading job info:', error);
    document.getElementById('status-badge').textContent = 'Detection Failed';
    document.getElementById('status-badge').className = 'status-badge badge-not-ready';
  }
}

function updateChecklistItem(elementId, isSuccess, successText, failText) {
  const element = document.getElementById(elementId);
  const icon = element.previousElementSibling;

  if (isSuccess) {
    icon.className = 'info-icon icon-check';
    icon.textContent = '✓';
    element.textContent = successText;
  } else {
    icon.className = 'info-icon icon-x';
    icon.textContent = '✗';
    element.textContent = failText;
  }
}

async function loadResumeSelector() {
  const data = await chrome.storage.local.get('user_profile');
  const resumes = data.user_profile?.resumes || [];

  if (resumes.length <= 1) {
    // Hide selector if only one or no resumes
    document.getElementById('resume-selector-container').classList.add('hidden');
    return;
  }

  // Show selector if multiple resumes
  document.getElementById('resume-selector-container').classList.remove('hidden');

  const selector = document.getElementById('resume-selector');
  const defaultResume = resumes.find(r => r.isDefault);

  // Populate options
  selector.innerHTML = `
    <option value="">Use default resume (${defaultResume?.name || 'None'})</option>
    ${resumes.map(resume => `
      <option value="${resume.id}" ${resume.isDefault ? 'selected' : ''}>
        ${resume.name} ${resume.isDefault ? '(Default)' : ''}
      </option>
    `).join('')}
  `;
}

async function getSelectedResume() {
  const data = await chrome.storage.local.get('user_profile');
  const resumes = data.user_profile?.resumes || [];

  // If only one resume, use it
  if (resumes.length === 1) {
    return resumes[0];
  }

  // Check if user selected a specific resume
  const selector = document.getElementById('resume-selector');
  const selectedId = selector?.value;

  if (selectedId) {
    return resumes.find(r => r.id === selectedId);
  }

  // Otherwise, use default
  return resumes.find(r => r.isDefault) || resumes[0];
}

async function handleApply() {
  const button = document.getElementById('apply-button');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  // Disable button
  button.disabled = true;
  button.textContent = '⏳ Applying...';

  // Show progress
  progressContainer.classList.remove('hidden');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Get selected resume
    const selectedResume = await getSelectedResume();

    if (!selectedResume) {
      throw new Error('No resume selected. Please upload a resume in settings.');
    }

    // Send apply command to content script with selected resume
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'applyToJob',
      previewMode: await isPreviewModeEnabled(),
      resume: selectedResume
    });

    if (response.success) {
      // Update progress
      progressFill.style.width = '100%';
      progressText.textContent = 'Application submitted! ✓';

      // Update stats
      await incrementApplicationCount();
      await loadStats();

      // Show success
      button.textContent = '✓ Applied Successfully!';
      button.style.background = '#10b981';

      // Track in storage
      await trackApplication(response.applicationId);

      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      throw new Error(response.error || 'Application failed');
    }
  } catch (error) {
    console.error('Apply error:', error);
    progressText.textContent = `Error: ${error.message}`;
    progressFill.style.background = '#ef4444';
    button.textContent = '❌ Failed - Try Again';
    button.disabled = false;
  }
}

async function handlePreview() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'previewApplication'
    });

    if (response.success) {
      // Open preview in new tab or modal
      alert(`Preview:\n\n${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.error('Preview error:', error);
  }
}

async function incrementApplicationCount() {
  const today = new Date().toISOString().split('T')[0];
  const data = await chrome.storage.local.get(['applications_today', 'last_reset_date', 'total_applications']);

  let applicationsToday = data.applications_today || 0;
  let totalApplications = data.total_applications || 0;

  // Reset if new day
  if (data.last_reset_date !== today) {
    applicationsToday = 0;
  }

  await chrome.storage.local.set({
    applications_today: applicationsToday + 1,
    total_applications: totalApplications + 1,
    last_reset_date: today
  });
}

async function trackApplication(applicationId) {
  const applications = await chrome.storage.local.get('application_history') || { application_history: [] };
  const history = applications.application_history || [];

  history.push({
    id: applicationId,
    timestamp: new Date().toISOString(),
    url: (await chrome.tabs.query({ active: true, currentWindow: true }))[0].url
  });

  await chrome.storage.local.set({ application_history: history });
}

async function isPreviewModeEnabled() {
  const settings = await chrome.storage.local.get('preview_mode');
  return settings.preview_mode !== false; // Default to true
}

function openDashboard() {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
}

function openSettings() {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
}
