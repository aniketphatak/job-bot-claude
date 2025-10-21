// JobBot Indeed Content Script
// Note: Indeed support is a placeholder for future implementation

console.log('[JobBot] Indeed content script loaded');

async function detectIndeedJob(jobInfo) {
  try {
    // Extract job details from Indeed page
    const titleElement = document.querySelector('.jobsearch-JobInfoHeader-title');
    const companyElement = document.querySelector('[data-company-name="true"]');

    jobInfo.job = {
      title: titleElement?.textContent?.trim() || 'Unknown Position',
      company: companyElement?.textContent?.trim() || 'Unknown Company',
      matchScore: 80 // TODO: Calculate actual match score
    };

    // Check for Indeed's "Apply Now" button
    const applyButton = document.querySelector('.indeedApplyButton, .jobsearch-IndeedApplyButton');

    if (applyButton) {
      jobInfo.canApply = false; // Placeholder - Indeed integration not yet implemented
      jobInfo.reason = 'Indeed support coming soon';
      jobInfo.fieldsDetected = 0;
    } else {
      jobInfo.canApply = false;
      jobInfo.reason = 'Apply button not found';
    }

  } catch (error) {
    console.error('Error detecting Indeed job:', error);
    jobInfo.canApply = false;
    jobInfo.reason = 'Detection error';
  }

  return jobInfo;
}

async function applyToJob(previewMode = true, selectedResume = null) {
  logAction('applyToJob', { previewMode, resume: selectedResume?.name });

  return {
    success: false,
    error: 'Indeed support is not yet implemented. Currently supports LinkedIn Easy Apply only.'
  };
}

async function previewApplication() {
  return {
    success: false,
    error: 'Indeed preview not yet implemented'
  };
}

// Inject JobBot indicator on page
function injectPageIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'jobbot-indicator';
  indicator.innerHTML = '🤖 JobBot (Indeed support coming soon)';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(indicator);

  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.style.transition = 'opacity 0.5s';
    setTimeout(() => indicator.remove(), 500);
  }, 3000);
}

// Initialize
if (document.body) {
  injectPageIndicator();
} else {
  document.addEventListener('DOMContentLoaded', injectPageIndicator);
}
