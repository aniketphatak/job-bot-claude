// JobBot Background Service Worker

console.log('[JobBot] Background service worker initialized');

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[JobBot] Extension installed');

  // Set default settings
  const defaults = {
    daily_limit: 15,
    applications_today: 0,
    total_applications: 0,
    preview_mode: true, // Start in safe preview mode
    last_reset_date: new Date().toISOString().split('T')[0],
    user_profile: {
      full_name: '',
      email: '',
      phone: '',
      years_of_experience: '',
      willing_to_relocate: false,
      work_authorized: true,
      salary_expectation: '',
      resumes: [], // Array of resume objects
      cover_letter_template: ''
    }
  };

  // Only set if not already set
  const existing = await chrome.storage.local.get(Object.keys(defaults));
  const toSet = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (existing[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);

    // Open settings page on first install to configure profile
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  }
});

// Reset daily counter at midnight
async function resetDailyCounter() {
  const today = new Date().toISOString().split('T')[0];
  const data = await chrome.storage.local.get('last_reset_date');

  if (data.last_reset_date !== today) {
    await chrome.storage.local.set({
      applications_today: 0,
      last_reset_date: today
    });
    console.log('[JobBot] Daily counter reset');
  }
}

// Check and reset daily counter every hour
setInterval(resetDailyCounter, 60 * 60 * 1000);

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackApplication') {
    trackApplication(request.data).then(sendResponse);
    return true;
  } else if (request.action === 'getSettings') {
    chrome.storage.local.get(null).then(sendResponse);
    return true;
  }
});

async function trackApplication(appData) {
  const data = await chrome.storage.local.get(['applications_today', 'total_applications', 'application_history']);

  const applicationsToday = (data.applications_today || 0) + 1;
  const totalApplications = (data.total_applications || 0) + 1;
  const history = data.application_history || [];

  history.push({
    ...appData,
    timestamp: new Date().toISOString()
  });

  await chrome.storage.local.set({
    applications_today: applicationsToday,
    total_applications: totalApplications,
    application_history: history
  });

  return { success: true };
}

// Sync with backend (if available)
async function syncWithBackend() {
  try {
    const data = await chrome.storage.local.get('backend_url');
    if (data.backend_url) {
      const history = await chrome.storage.local.get('application_history');

      await fetch(`${data.backend_url}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications: history.application_history })
      });

      console.log('[JobBot] Synced with backend');
    }
  } catch (error) {
    console.error('[JobBot] Backend sync error:', error);
  }
}

// Sync every 30 minutes
setInterval(syncWithBackend, 30 * 60 * 1000);
