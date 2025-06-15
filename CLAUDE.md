# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JobBot is an AI-powered job search automation platform that acts as a personal job search assistant. The application helps users:
- **Discover opportunities** within critical 3-hour application windows  
- **Generate personalized content** (cover letters, resume summaries, LinkedIn messages) using AI
- **Track campaigns** targeting specific companies, roles, and salary ranges
- **Monitor applications** and analyze success metrics
- **Integrate with LinkedIn** for profile access and job searching

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
- **models/**: Pydantic models (User, Campaign, Job, Application)
- **services/**: Business logic layer with 7 main services:
  - `user_service.py`: User profile management
  - `campaign_service.py`: Job search campaigns 
  - `job_service.py`: Job listings with 3-hour urgency windows
  - `application_service.py`: Application tracking
  - `analytics_service.py`: Dashboard metrics and insights
  - `ai_service.py`: AI content generation (cover letters, resume summaries, LinkedIn messages)
  - `linkedin_service.py`: LinkedIn OAuth and job search integration

### Frontend Structure  
- **App.js**: Main React router with 6 core pages
- **components/**: Page components (Dashboard, Jobs, Campaigns, Profile, Settings, Integrations)
- **components/ui/**: Reusable UI components using Radix UI primitives
- **hooks/**: Custom React hooks including toast notifications
- **mock/**: Mock data for development and testing

### Key Business Logic

**Core Value Proposition**: The 3-hour advantage - applying to jobs within 3 hours of posting for maximum visibility before the applicant pool grows.

- **3-Hour Job Window**: Jobs are marked as "urgent" within 3 hours of posting to maximize application success
- **AI Content Generation**: Uses OpenAI/Anthropic to generate personalized cover letters, resume summaries, and LinkedIn messages tailored to each job and user profile
- **Campaign Management**: Users create targeted job search campaigns with specific keywords, companies, salary ranges, and exclusion lists (e.g., current employer)
- **LinkedIn Integration**: OAuth flow for profile access and job searching with rate limiting and fallback to demo data
- **Analytics Dashboard**: Tracks application success rates, response rates by company type, and optimizes strategies based on performance data

### Database Collections (MongoDB)
- `users`: User profiles with experience, skills, education
- `campaigns`: Job search campaigns with targeting criteria  
- `jobs`: Job listings with urgency tracking
- `applications`: Application history and status
- `generated_cover_letters`: AI-generated cover letters
- `generated_resume_summaries`: AI-generated resume summaries
- `generated_linkedin_messages`: AI-generated LinkedIn messages
- `user_ai_preferences`: User AI provider preferences

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
- `/users/*`: User profile CRUD operations
- `/campaigns/*`: Campaign management
- `/jobs/*`: Job listings and application tracking
- `/applications/*`: Application history
- `/ai/*`: AI content generation endpoints
- `/linkedin/*`: LinkedIn integration and OAuth
- `/users/{user_id}/analytics`: Dashboard analytics

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