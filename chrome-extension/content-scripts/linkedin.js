// JobBot LinkedIn Content Script

console.log('[JobBot] LinkedIn content script loaded');

async function detectLinkedInJob(jobInfo) {
  try {
    // Extract job details from page
    const titleElement = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title');
    const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name');

    jobInfo.job = {
      title: titleElement?.textContent?.trim() || 'Unknown Position',
      company: companyElement?.textContent?.trim() || 'Unknown Company',
      matchScore: 85 // TODO: Calculate actual match score
    };

    // Check for Easy Apply button
    const easyApplyButton = document.querySelector('.jobs-apply-button--top-card, .jobs-apply-button');

    if (easyApplyButton) {
      jobInfo.canApply = true;
      jobInfo.fieldsDetected = await detectFormFields();

      // Generate cover letter (mock for now)
      jobInfo.hasCoverLetter = true;
    } else {
      jobInfo.canApply = false;
      jobInfo.reason = 'Easy Apply not available';
    }

    // Check if already applied
    const alreadyApplied = document.querySelector('.jobs-s-apply__application-link');
    if (alreadyApplied) {
      jobInfo.canApply = false;
      jobInfo.reason = 'Already applied';
    }

  } catch (error) {
    console.error('Error detecting LinkedIn job:', error);
    jobInfo.canApply = false;
    jobInfo.reason = 'Detection error';
  }

  return jobInfo;
}

async function detectFormFields() {
  // This would analyze the form when Easy Apply modal opens
  // For now, return estimated count
  return 8;
}

async function applyToJob(previewMode = true, selectedResume = null) {
  logAction('applyToJob', { previewMode, resume: selectedResume?.name });

  try {
    // Get user profile data
    const userData = await getUserProfile();
    if (!userData) {
      throw new Error('No user profile found. Please set up your profile first.');
    }

    // Use selected resume or get default
    const resume = selectedResume || await getDefaultResume();
    if (!resume) {
      throw new Error('No resume available. Please upload a resume in settings.');
    }

    logAction('Using resume', resume.name);

    // Step 1: Click Easy Apply button
    logAction('Step 1', 'Clicking Easy Apply button');
    const easyApplyButton = document.querySelector('.jobs-apply-button--top-card, .jobs-apply-button');
    if (!easyApplyButton) {
      throw new Error('Easy Apply button not found');
    }

    easyApplyButton.click();
    await sleep(1000);

    // Wait for modal to appear
    const modal = await waitForElement('.jobs-easy-apply-modal', 3000);
    if (!modal) {
      throw new Error('Application modal did not appear');
    }

    logAction('Modal opened', 'Starting form fill process');

    // Step 2: Auto-fill form fields with selected resume
    await autoFillLinkedInForm(userData, resume, previewMode);

    // Step 3: Navigate through steps
    const totalSteps = detectTotalSteps();
    logAction('Detected steps', totalSteps);

    for (let step = 1; step <= totalSteps; step++) {
      logAction(`Step ${step}/${totalSteps}`, 'Processing');

      // Fill current step
      await fillCurrentStep(userData, resume, step);

      // Click Next or Review/Submit
      if (step < totalSteps) {
        const nextButton = document.querySelector('button[aria-label="Continue to next step"], button[aria-label="Next"]');
        if (nextButton && !nextButton.disabled) {
          nextButton.click();
          await sleep(800);
        }
      } else {
        // Final step
        if (previewMode) {
          logAction('Preview Mode', 'Stopping before submit');
          return {
            success: true,
            previewOnly: true,
            message: 'Preview complete. Application ready to submit.'
          };
        } else {
          // Actually submit
          const submitButton = document.querySelector('button[aria-label="Submit application"], button[aria-label="Submit"]');
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
            await sleep(2000);

            return {
              success: true,
              applicationId: generateApplicationId(),
              message: 'Application submitted successfully!'
            };
          } else {
            throw new Error('Submit button not found or disabled');
          }
        }
      }
    }

  } catch (error) {
    logAction('Error', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function autoFillLinkedInForm(userData, resume, previewMode) {
  // Contact Information
  fillTextInput('input[id*="phoneNumber"], input[name="phoneNumber"]', userData.phone);
  fillTextInput('input[id*="email"], input[name="email"]', userData.email);

  // Resume upload (if file input present)
  const resumeInput = document.querySelector('input[type="file"][name*="resume"], input[type="file"][id*="resume"]');
  if (resumeInput && resume) {
    await uploadFile('input[type="file"][name*="resume"]', resume);
    logAction('Resume uploaded', resume.name);
  }

  // Cover letter
  const coverLetterField = document.querySelector('textarea[name*="coverLetter"], textarea[id*="coverLetter"]');
  if (coverLetterField && userData.cover_letter) {
    fillTextInput('textarea[name*="coverLetter"]', userData.cover_letter);
    logAction('Cover letter filled', `${userData.cover_letter.length} chars`);
  }

  // Standard questions
  await fillStandardQuestions(userData);
}

async function fillStandardQuestions(userData) {
  // Years of experience
  const expInput = document.querySelector('input[name*="experience"], input[id*="years"]');
  if (expInput) {
    fillTextInput('input[name*="experience"]', userData.years_of_experience || '10');
  }

  // Work authorization
  const authRadio = document.querySelector('input[type="radio"][value*="yes"], input[value="Yes"]');
  if (authRadio) {
    authRadio.click();
  }

  // Willing to relocate
  const relocateRadio = document.querySelector('input[value*="' + (userData.willing_to_relocate ? 'yes' : 'no') + '"]');
  if (relocateRadio) {
    relocateRadio.click();
  }

  // Salary expectations (if present)
  const salaryInput = document.querySelector('input[name*="salary"], input[id*="salary"]');
  if (salaryInput && userData.salary_expectation) {
    fillTextInput('input[name*="salary"]', userData.salary_expectation);
  }
}

async function fillCurrentStep(userData, resume, stepNumber) {
  // This function would handle step-specific logic
  // For now, it's a placeholder
  logAction(`Filling step ${stepNumber}`, 'In progress');
  await sleep(300);
}

function detectTotalSteps() {
  // Try to detect from progress indicator
  const progressElement = document.querySelector('.jobs-easy-apply-modal__progress');
  if (progressElement) {
    const text = progressElement.textContent;
    const match = text.match(/of (\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Default to 3 steps (common for LinkedIn)
  return 3;
}

async function previewApplication() {
  const userData = await getUserProfile();
  const defaultResume = await getDefaultResume();

  return {
    success: true,
    data: {
      personalInfo: {
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone
      },
      resume: defaultResume?.name || 'No resume',
      coverLetter: userData.cover_letter?.substring(0, 100) + '...' || 'No cover letter',
      workAuthorization: 'Authorized',
      yearsExperience: userData.years_of_experience || '10'
    }
  };
}

async function getUserProfile() {
  const data = await chrome.storage.local.get('user_profile');
  return data.user_profile || null;
}

async function getDefaultResume() {
  const userData = await getUserProfile();
  const resumes = userData?.resumes || [];
  return resumes.find(r => r.isDefault) || resumes[0] || null;
}

function generateApplicationId() {
  return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Inject JobBot indicator on page
function injectPageIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'jobbot-indicator';
  indicator.innerHTML = '🤖 JobBot Active';
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
injectPageIndicator();
