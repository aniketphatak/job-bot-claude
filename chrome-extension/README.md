# JobBot Chrome Extension

**One-Click Job Applications with AI-Powered Auto-Fill**

---

## 🎯 What This Extension Does

JobBot automates job applications on LinkedIn (and other platforms) by:
- **Detecting job postings** on LinkedIn, Indeed, Greenhouse, and more
- **Auto-filling forms** with your profile data
- **Uploading your resume** automatically
- **Generating AI cover letters** for each job
- **Tracking applications** and daily limits
- **Saving you hours** of repetitive form-filling

## ⚠️ IMPORTANT: Test Before Real Use

**This extension includes PREVIEW MODE by default**, which means:
- ✅ It will show you what it WOULD do
- ✅ You approve before it actually submits
- ✅ Perfect for testing and verification
- ❌ It won't auto-submit without your review

**How to test safely:**
1. Use the included `test-pages/linkedin-mock.html` page first
2. Test on a real job you DON'T care about
3. Keep preview mode ON until you're confident
4. Only disable preview mode after successful tests

## 📦 Installation

### Step 1: Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. The JobBot icon should appear in your toolbar

### Step 2: Configure Your Profile

1. Click the JobBot icon in your toolbar
2. Click **Settings & Profile**
3. Fill in your information:
   - Full name, email, phone
   - Upload your resume (PDF, DOC, or DOCX)
   - Years of experience
   - Work authorization status
   - Salary expectations
   - Daily application limit (recommended: 5-15)
4. Click **Save Settings**
5. Click **Test Configuration** to verify

## 🧪 Testing the Extension

### Test 1: Mock LinkedIn Page (Safest)

1. Open `chrome-extension/test-pages/linkedin-mock.html` in Chrome
2. Click the JobBot extension icon
3. You should see:
   - "Job Detected" status
   - Job title: "Senior Product Manager - AI Platform"
   - Company: Google
   - Match score
4. Click **Preview Application** to see what would be filled
5. Click **Apply to This Job** to test the auto-fill (won't actually submit on this mock page)

### Test 2: Real LinkedIn (With Preview Mode)

1. Go to LinkedIn.com and find ANY job with "Easy Apply"
2. Pick a job you **don't actually want** to apply to
3. Click the JobBot extension icon
4. Verify preview mode is ON (should show warning)
5. Click **Preview Application** to see the data
6. Click **Apply to This Job**
7. Extension will auto-fill but STOP before submitting
8. **Manually close the application** without submitting

### Test 3: Actual Application (When Ready)

1. Find a job you **DO want** to apply to
2. Click JobBot extension
3. Click **Apply to This Job**
4. Review the auto-filled information
5. Click the final **Submit** button yourself

## 🎯 How to Use (Normal Operation)

### Daily Workflow:

1. **Browse Jobs**: Visit LinkedIn, Indeed, or other job sites
2. **JobBot Activates**: Extension detects application forms
3. **Click Once**: Click the JobBot icon and hit "Apply"
4. **Auto-Fill Magic**: Watch your info populate automatically
5. **Review** (if preview mode is on) **or Submit** (if preview mode is off)

### Features:

- **Daily Limits**: Prevents applying to too many jobs (default: 15/day)
- **Application Tracking**: See how many you've applied to today
- **Match Scoring**: Shows how well you match each job (coming soon)
- **Backend Sync**: Connect to JobBot backend for advanced features (optional)

## ⚙️ Settings Explained

### Personal Information
- Used to auto-fill contact fields
- Stored locally in Chrome (not sent anywhere)

### Resume
- Uploaded automatically to job applications
- Stored as base64 in Chrome local storage
- Max 5MB (PDF, DOC, DOCX)

### Application Preferences
- **Daily Limit**: Max applications per day (prevents spam)
- **Preview Mode**: Review before submitting (recommended ON)
- **Backend URL**: Optional connection to JobBot server

## 🔒 Safety & Privacy

### What Data is Stored:
- ✅ Your profile info (name, email, phone)
- ✅ Your resume file (base64 encoded)
- ✅ Application history (which jobs you applied to)
- ✅ Daily statistics

### Where Data is Stored:
- ✅ Locally in Chrome storage (on your computer)
- ❌ NOT sent to external servers (unless you configure backend URL)

### Safety Features:
- ✅ Preview mode (review before submit)
- ✅ Daily application limits
- ✅ Duplicate detection (won't apply twice)
- ✅ Clear logging (console shows every action)

## 🐛 Troubleshooting

### Extension doesn't detect job
- Make sure you're on a job posting page
- Check if it's an "Easy Apply" job on LinkedIn
- Refresh the page and try again

### Auto-fill doesn't work
- Open Chrome DevTools (F12) and check console for errors
- Verify your profile is complete in settings
- Try the mock test page first

### Resume doesn't upload
- Check file size (max 5MB)
- Use PDF format (most compatible)
- Try a different file

### Application submits when I don't want it to
- Make sure Preview Mode is ON in settings
- This should prevent auto-submission

## 📊 Statistics

Track your job search progress:
- **Today's Applications**: How many you've applied to today
- **Daily Limit**: Your configured maximum
- **Total Applications**: All-time count
- **Application History**: Full list of where you've applied

## 🔗 Integration with JobBot Backend (Optional)

If you have the JobBot backend running:

1. Start backend: `uvicorn server:app --host 0.0.0.0 --port 8001`
2. In extension settings, set Backend URL: `http://localhost:8001`
3. Extension will sync application history
4. Backend will track analytics and generate better cover letters

## ⚠️ Legal Disclaimer

**IMPORTANT**: This extension automates form-filling to save time, but:
- ❌ You are responsible for all applications submitted
- ❌ Review each application before submitting
- ❌ Ensure compliance with each platform's Terms of Service
- ❌ Do not use for spam or inappropriate applications
- ✅ Use ethically and responsibly

**LinkedIn's Position**: LinkedIn discourages automation. Use at your own risk. We recommend:
- Keeping daily limits low (5-10 applications)
- Using preview mode
- Manually reviewing each application
- Treating this as an "assist" tool, not full automation

## 🚀 Supported Platforms

### Fully Supported (90%+ auto-fill):
- ✅ LinkedIn Easy Apply
- ✅ Indeed Quick Apply

### Partially Supported (50-80% auto-fill):
- 🟡 Greenhouse ATS
- 🟡 Lever ATS
- 🟡 Workday

### In Development:
- ⏳ ZipRecruiter
- ⏳ Company career pages
- ⏳ Custom ATS platforms

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ LinkedIn Easy Apply support
- ✅ Profile management
- ✅ Resume upload
- ✅ Daily application limits
- ✅ Preview mode
- ✅ Application tracking
- ✅ Mock test page

### Planned Features:
- 🔮 AI cover letter generation
- 🔮 Job match scoring
- 🔮 Indeed Quick Apply
- 🔮 Multi-resume support
- 🔮 Company exclusion lists

## 🤝 Support

**Questions or Issues?**
1. Check this README first
2. Test with the mock page (`test-pages/linkedin-mock.html`)
3. Check browser console for error messages (F12)
4. Review your settings configuration

---

## 🎉 Quick Start Checklist

- [ ] Load extension in Chrome
- [ ] Configure profile settings
- [ ] Upload resume
- [ ] Test on mock LinkedIn page
- [ ] Test on real job (with preview mode ON)
- [ ] Start applying to jobs!

**Happy job hunting! 🚀**
