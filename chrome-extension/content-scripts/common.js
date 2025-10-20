// JobBot Common Content Script Utilities

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobInfo') {
    const jobInfo = detectJobInfo();
    sendResponse(jobInfo);
  } else if (request.action === 'applyToJob') {
    applyToJob(request.previewMode, request.resume).then(sendResponse);
    return true; // Async response
  } else if (request.action === 'previewApplication') {
    previewApplication().then(sendResponse);
    return true;
  }
});

async function detectJobInfo() {
  const platform = detectPlatform();

  let jobInfo = {
    platform,
    job: {},
    canApply: false,
    hasResume: await hasResumeStored(),
    hasCoverLetter: false,
    fieldsDetected: 0,
    reason: ''
  };

  if (platform === 'linkedin') {
    jobInfo = await detectLinkedInJob(jobInfo);
  } else if (platform === 'indeed') {
    jobInfo = await detectIndeedJob(jobInfo);
  }

  return jobInfo;
}

function detectPlatform() {
  const url = window.location.href;

  if (url.includes('linkedin.com/jobs')) return 'linkedin';
  if (url.includes('indeed.com/viewjob')) return 'indeed';
  if (url.includes('greenhouse.io')) return 'greenhouse';
  if (url.includes('lever.co')) return 'lever';

  return 'unknown';
}

async function hasResumeStored() {
  const data = await chrome.storage.local.get('user_profile');
  const resumes = data.user_profile?.resumes || [];
  return resumes.length > 0;
}

// Utility: Fill text input
function fillTextInput(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  return false;
}

// Utility: Click button with retry
async function clickButton(selector, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const button = document.querySelector(selector);
    if (button && !button.disabled) {
      button.click();
      await sleep(500);
      return true;
    }
    await sleep(300);
  }
  return false;
}

// Utility: Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Wait for element
async function waitForElement(selector, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(100);
  }
  return null;
}

// Utility: Upload file
async function uploadFile(inputSelector, fileData) {
  const input = document.querySelector(inputSelector);
  if (!input) return false;

  try {
    // Create a File object from base64 data
    const blob = base64ToBlob(fileData.content, fileData.type);
    const file = new File([blob], fileData.name, { type: fileData.type });

    // Create DataTransfer to set files
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (error) {
    console.error('File upload error:', error);
    return false;
  }
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

// Log actions for debugging
function logAction(action, details) {
  console.log(`[JobBot] ${action}:`, details);
}
