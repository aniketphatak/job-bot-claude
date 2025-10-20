# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JobBot is an AI-powered job search automation platform that acts as a personal job search assistant. The application helps users:
- **Discover opportunities** within critical 3-hour application windows
- **Generate personalized content** (cover letters, resume summaries, LinkedIn messages) using AI
- **Automatically find and apply** to jobs matching your criteria with smart safety controls
- **Track campaigns** targeting specific companies, roles, and salary ranges
- **Monitor applications** and analyze success metrics
- **Integrate with LinkedIn** for profile access and job searching
- **Manage multiple resumes** with version control and automatic selection

**Local Demo**: http://localhost:3000 (when running locally)

**Architecture:**
- **Backend**: FastAPI server with MongoDB for data persistence
- **Frontend**: React SPA with Tailwind CSS and component library
- **AI Integration**: OpenAI and Anthropic models for content generation
- **LinkedIn Integration**: OAuth-based job searching and profile access

## Development Commands

### Backend (Python/FastAPI)
```bash
# Install dependencies
cd backend && pip install -r requirements.txt

# Run development server  
cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Run demo with sample data
cd backend && python demo_jobbot.py

# Run tests
cd backend && python -m pytest

# Code formatting and linting
cd backend && black . && isort . && flake8 . && mypy .
```

### Frontend (React)
```bash
# Install dependencies
cd frontend && yarn install

# Run development server
cd frontend && yarn start

# Build production bundle
cd frontend && yarn build

# Run tests
cd frontend && yarn test

# Lint code
cd frontend && yarn run lint
```

## Architecture Details

### Backend Structure
- **server.py**: Main FastAPI application with all API endpoints
- **models/**: Pydantic models (User, Campaign, Job, Application, Resume, AutomationSettings)
- **services/**: Business logic layer with 10 main services:
  - `user_service.py`: User profile management
  - `campaign_service.py`: Job search campaigns
  - `job_service.py`: Job listings with 3-hour urgency windows
  - `application_service.py`: Application tracking
  - `analytics_service.py`: Dashboard metrics and insights
  - `ai_service.py`: AI content generation (cover letters, resume summaries, LinkedIn messages)
  - `linkedin_service.py`: LinkedIn OAuth and job search integration
  - `resume_service.py`: Resume upload, versioning, and management
  - `auto_apply_service.py`: Automated job application with safety controls
  - `scheduler_service.py`: Background scheduler for automated job search (runs every 15 minutes)

### Frontend Structure  
- **App.js**: Main React router with 6 core pages
- **components/**: Page components (Dashboard, Jobs, Campaigns, Profile, Settings, Integrations)
- **components/ui/**: Reusable UI components using Radix UI primitives
- **hooks/**: Custom React hooks including toast notifications
- **mock/**: Mock data for development and testing

### Key Business Logic

**Core Value Proposition**: The 3-hour advantage - automatically applying to jobs within 3 hours of posting for maximum visibility before the applicant pool grows.

- **3-Hour Job Window**: Jobs are marked as "urgent" within 3 hours of posting to maximize application success
- **Automated Job Application**: Background scheduler runs every 15 minutes to find and apply to jobs matching user criteria
- **Smart Safety Controls**: Daily application limits (default: 10/day), company exclusion lists, match score thresholds, keyword filters, and approval workflows
- **Resume Management**: Support for multiple resume versions with automatic selection of primary resume for applications
- **AI Content Generation**: Uses OpenAI/Anthropic to generate personalized cover letters, resume summaries, and LinkedIn messages tailored to each job and user profile
- **Campaign Management**: Users create targeted job search campaigns with specific keywords, companies, salary ranges, and exclusion lists (e.g., current employer)
- **LinkedIn Integration**: OAuth flow for profile access and job searching with rate limiting and fallback to demo data
- **Analytics Dashboard**: Tracks application success rates, response rates by company type, auto-apply statistics, and optimizes strategies based on performance data

### Database Collections (MongoDB)
- `user_profiles`: User profiles with experience, skills, education, resumes, and automation settings
- `job_search_campaigns`: Job search campaigns with targeting criteria
- `jobs`: Job listings with urgency tracking
- `applications`: Application history and status (includes auto-apply tracking)
- `generated_cover_letters`: AI-generated cover letters
- `generated_resume_summaries`: AI-generated resume summaries
- `generated_linkedin_messages`: AI-generated LinkedIn messages
- `user_ai_preferences`: User AI provider preferences

### Automation Features

**Auto-Apply Configuration** (`automation_settings` in user profile):
- `enabled`: Master switch for all automation
- `auto_apply_enabled`: Enable automatic job applications
- `daily_application_limit`: Max applications per day (default: 10)
- `min_match_score`: Minimum match score threshold (0-1, default: 0.75)
- `urgency_levels`: Which urgency levels to auto-apply to (default: ["critical", "high"])
- `approval_mode`: "auto" (apply immediately) or "review_before_apply" (notify for approval)
- `excluded_companies`: List of companies to never apply to (e.g., current employer)
- `required_keywords`: Must-have keywords in job description
- `excluded_keywords`: Dealbreaker keywords to avoid
- `auto_generate_content`: Automatically generate cover letters and resume summaries
- `notification_email`: Email for application notifications

**Resume Management**:
- Multiple resume support with versioning
- Primary resume auto-selection for applications
- File upload (PDF, DOC, DOCX, max 5MB)
- Resume parsing for AI-powered tailoring (placeholder for future ML integration)

**Scheduler Service**:
- Runs every 15 minutes to check for new jobs
- Expires jobs past 3-hour deadline (runs every 30 minutes)
- Resets daily application counters at midnight
- Manual trigger available via API for immediate auto-apply

### Environment Setup
Required environment variables in `backend/.env`:
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name (default: 'jobbot')
- `OPENAI_API_KEY`: OpenAI API key for AI content generation
- `ANTHROPIC_API_KEY`: Anthropic API key for AI content generation
- LinkedIn OAuth credentials for job search integration

### Testing & Validation
The application has been comprehensively tested with the following verified functionality:
- **Dashboard**: Real-time metrics, analytics, and professional statistics display
- **Profile Management**: Full CRUD operations with form validation and error handling
- **Campaign Management**: Creation, editing, pause/activate controls with proper validation
- **Job Filtering**: Successfully excludes specified companies (e.g., Amazon/Audible)
- **Responsive Design**: Works across different screen sizes
- **Interactive Elements**: All modals, forms, dropdowns, and navigation function properly
- **Data Handling**: Graceful loading states and fallback content

### API Structure
All backend endpoints use `/api` prefix. Key endpoint groups:

**User Management:**
- `POST /api/users` - Create user profile
- `GET /api/users/{user_id}` - Get user profile
- `PUT /api/users/{user_id}` - Update user profile
- `GET /api/users` - List all users

**Resume Management:**
- `POST /api/users/{user_id}/resumes` - Upload new resume (PDF/DOC/DOCX, max 5MB)
- `GET /api/users/{user_id}/resumes` - Get all user resumes
- `GET /api/users/{user_id}/resumes/{resume_id}` - Get specific resume
- `POST /api/users/{user_id}/resumes/{resume_id}/set-primary` - Set primary resume
- `DELETE /api/users/{user_id}/resumes/{resume_id}` - Delete resume

**Automation Settings:**
- `GET /api/users/{user_id}/automation-settings` - Get automation configuration
- `PUT /api/users/{user_id}/automation-settings` - Update automation settings

**Auto-Apply:**
- `GET /api/users/{user_id}/auto-apply/stats` - Get auto-apply statistics
- `POST /api/users/{user_id}/auto-apply/trigger` - Manually trigger auto-apply
- `POST /api/users/{user_id}/auto-apply/evaluate/{job_id}` - Evaluate job for auto-apply

**Campaign Management:**
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/{campaign_id}` - Get campaign details
- `PUT /api/campaigns/{campaign_id}` - Update campaign
- `DELETE /api/campaigns/{campaign_id}` - Delete campaign
- `GET /api/users/{user_id}/campaigns` - Get user's campaigns

**Job Listings:**
- `POST /api/jobs` - Create job listing
- `GET /api/jobs/{job_id}` - Get job details
- `GET /api/campaigns/{campaign_id}/jobs` - Get jobs for campaign
- `POST /api/jobs/expire` - Manually expire old jobs

**Applications:**
- `POST /api/applications` - Create new application
- `GET /api/applications/{application_id}` - Get application details
- `PUT /api/applications/{application_id}` - Update application status
- `GET /api/users/{user_id}/applications` - Get user's applications
- `GET /api/campaigns/{campaign_id}/applications` - Get campaign applications

**AI Services:**
- `GET /api/ai/models` - Get available AI models
- `GET /api/users/{user_id}/ai/preferences` - Get AI preferences
- `POST /api/users/{user_id}/ai/preferences` - Set AI preferences
- `POST /api/users/{user_id}/ai/generate-cover-letter` - Generate cover letter
- `POST /api/users/{user_id}/ai/generate-resume-summary` - Generate resume summary
- `POST /api/users/{user_id}/ai/generate-linkedin-message` - Generate LinkedIn message
- `GET /api/users/{user_id}/ai/history` - Get AI generation history

**LinkedIn Integration:**
- `GET /api/linkedin/auth-url` - Get OAuth URL
- `POST /api/linkedin/callback` - OAuth callback handler
- `GET /api/users/{user_id}/linkedin/profile` - Get LinkedIn profile
- `POST /api/users/{user_id}/linkedin/search-jobs` - Search jobs on LinkedIn
- `POST /api/users/{user_id}/linkedin/apply` - Apply to LinkedIn job
- `GET /api/linkedin/rate-limit` - Get rate limit status

**Analytics:**
- `GET /api/users/{user_id}/analytics` - Get comprehensive analytics
- `GET /api/users/{user_id}/dashboard` - Get dashboard statistics

**Scheduler:**
- `GET /api/scheduler/status` - Get scheduler status and job information

### Deployment Status
✅ **Production Ready**: The application has been fully tested and validated
✅ **Local Demo**: Available at http://localhost:3000 when running locally
✅ **Key Features Verified**:
  - Professional profile display with complete resume data
  - Smart job filtering (excludes current/former employers)
  - Real-time campaign management with proper controls
  - Responsive UI with polished appearance
  - Error handling and form validation throughout
  - Analytics dashboard with meaningful metrics

### Demo Features
When demonstrating the application:
- Shows professional profile with 10+ years experience
- Displays active job search campaigns with targeting criteria
- Demonstrates job filtering that avoids specified employers
- Showcases AI content generation capabilities
- Presents clean, professional interface suitable for business use