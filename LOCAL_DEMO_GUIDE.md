# JobBot Local Demo Setup Guide

## 🚀 Quick Start for Demo

This guide helps you run JobBot locally on your Mac laptop for demo purposes.

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- No MongoDB required (uses demo server with mock data)

### 1. Backend Setup (Demo Server)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the demo server with mock data
python demo_server.py
```

The demo server will start on `http://localhost:8001` with:
- ✅ Mock user profile (Aniket Phatak)
- ✅ Sample job search campaigns
- ✅ Demo job listings
- ✅ Analytics dashboard data
- ✅ AI content generation endpoints

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

### 3. Access the Demo

Open your browser to: **http://localhost:3000**

You'll see:
- **Dashboard**: Analytics and job metrics
- **Profile**: Pre-loaded professional profile
- **Campaigns**: Active job search campaign
- **Jobs**: Sample job opportunities
- **Settings**: AI preferences and configuration

## 🎯 Demo Features Working

### ✅ Fully Functional
- **User Profile Management**: Complete profile with experience, skills, education
- **Campaign Management**: Job search campaigns with targeting
- **Job Discovery**: Job listings with urgency indicators
- **Analytics Dashboard**: Metrics and performance tracking
- **Responsive UI**: Works on desktop and mobile
- **Navigation**: All pages load correctly

### ⚠️ Demo Mode (Mock Data)
- **AI Content Generation**: Returns demo content (requires OpenAI API key for real generation)
- **LinkedIn Integration**: Returns demo auth URLs
- **Database**: Uses in-memory mock data (no persistence)

## 🔧 For Real Deployment

To enable full functionality:

1. **Add API Keys** to `backend/.env`:
   ```
   OPENAI_API_KEY=your_actual_openai_key
   ANTHROPIC_API_KEY=your_actual_anthropic_key
   ```

2. **Setup MongoDB**:
   ```bash
   # Install MongoDB via Homebrew
   brew install mongodb-community
   brew services start mongodb-community

   # Update .env
   MONGO_URL=mongodb://localhost:27017
   ```

3. **Use Full Server**:
   ```bash
   # Instead of demo_server.py, use:
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

## 🐛 Issues Fixed for Demo

### Backend Issues Resolved:
- ✅ **Removed emergentintegrations dependency** - Replaced with direct OpenAI API calls
- ✅ **Created demo server** - No MongoDB required for demo
- ✅ **Environment configuration** - Created .env file with defaults
- ✅ **Import errors fixed** - All modules import successfully

### Frontend Issues Resolved:
- ✅ **Build process working** - No compilation errors
- ✅ **Dependencies installed** - All packages available
- ✅ **Node version compatibility** - Works with Node 18+

### Code Quality:
- ⚠️ **Linting warnings** - Many stylistic issues but no blocking errors
- ✅ **Core functionality** - All critical features work
- ✅ **API endpoints** - All routes respond correctly

## 📊 Demo URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api/
- **API Documentation**: http://localhost:8001/docs

## 🎪 Demo Script

1. **Show Dashboard** - Real-time metrics and analytics
2. **Review Profile** - Professional background and skills
3. **Browse Jobs** - Job opportunities with urgency indicators
4. **Campaign Management** - Targeted job search strategy
5. **AI Features** - Content generation capabilities (demo mode)

The application is ready for demonstration with a professional appearance and all core features functional!