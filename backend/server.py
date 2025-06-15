import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pathlib import Path
from typing import List, Optional

# Import models
from models.user import UserProfile, UserProfileCreate, UserProfileUpdate
from models.campaign import JobSearchCampaign, JobSearchCampaignCreate, JobSearchCampaignUpdate
from models.job import Job, JobCreate, JobUpdate
from models.application import Application, ApplicationCreate, ApplicationUpdate

# Import services
from services.user_service import UserService
from services.campaign_service import CampaignService
from services.job_service import JobService
from services.application_service import ApplicationService
from services.analytics_service import AnalyticsService
from services.ai_service import AIService
from services.linkedin_service import LinkedInService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'jobbot')]

# Initialize services
user_service = UserService(db)
campaign_service = CampaignService(db)
job_service = JobService(db)
application_service = ApplicationService(db)
analytics_service = AnalyticsService(db)
ai_service = AIService(db)
linkedin_service = LinkedInService(db)

# Create the main app without a prefix
app = FastAPI(title="JobBot API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "JobBot API is running!", "version": "1.0.0"}

# User Profile endpoints
@api_router.post("/users", response_model=UserProfile)
async def create_user_profile(profile_data: UserProfileCreate):
    """Create a new user profile"""
    try:
        return await user_service.create_user_profile(profile_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    profile = await user_service.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile

@api_router.put("/users/{user_id}", response_model=UserProfile)
async def update_user_profile(user_id: str, update_data: UserProfileUpdate):
    """Update user profile"""
    profile = await user_service.update_user_profile(user_id, update_data)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile

@api_router.get("/users", response_model=List[UserProfile])
async def list_user_profiles():
    """List all user profiles"""
    return await user_service.list_user_profiles()

# Campaign endpoints
@api_router.post("/campaigns", response_model=JobSearchCampaign)
async def create_campaign(campaign_data: JobSearchCampaignCreate):
    """Create a new job search campaign"""
    try:
        return await campaign_service.create_campaign(campaign_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/campaigns/{campaign_id}", response_model=JobSearchCampaign)
async def get_campaign(campaign_id: str):
    """Get campaign by ID"""
    campaign = await campaign_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@api_router.get("/users/{user_id}/campaigns", response_model=List[JobSearchCampaign])
async def get_user_campaigns(user_id: str):
    """Get all campaigns for a user"""
    return await campaign_service.get_campaigns_by_user(user_id)

@api_router.put("/campaigns/{campaign_id}", response_model=JobSearchCampaign)
async def update_campaign(campaign_id: str, update_data: JobSearchCampaignUpdate):
    """Update campaign"""
    campaign = await campaign_service.update_campaign(campaign_id, update_data)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@api_router.get("/campaigns", response_model=List[JobSearchCampaign])
async def get_active_campaigns():
    """Get all active campaigns"""
    return await campaign_service.get_active_campaigns()

# Job endpoints
@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate):
    """Create a new job"""
    try:
        return await job_service.create_job(job_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get job by ID"""
    job = await job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.get("/campaigns/{campaign_id}/jobs", response_model=List[Job])
async def get_campaign_jobs(campaign_id: str):
    """Get all jobs for a campaign"""
    return await job_service.get_jobs_by_campaign(campaign_id)

@api_router.get("/jobs", response_model=List[Job])
async def get_active_jobs(limit: int = 50):
    """Get active jobs (within 3-hour window)"""
    return await job_service.get_active_jobs(limit)

@api_router.put("/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, update_data: JobUpdate):
    """Update job"""
    job = await job_service.update_job(job_id, update_data)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.post("/jobs/{job_id}/apply")
async def mark_job_applied(job_id: str):
    """Mark job as applied"""
    success = await job_service.mark_job_as_applied(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job marked as applied"}

# Application endpoints
@api_router.post("/applications", response_model=Application)
async def create_application(application_data: ApplicationCreate):
    """Create a new application"""
    try:
        return await application_service.create_application(application_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/applications/{application_id}", response_model=Application)
async def get_application(application_id: str):
    """Get application by ID"""
    application = await application_service.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@api_router.get("/users/{user_id}/applications", response_model=List[Application])
async def get_user_applications(user_id: str):
    """Get all applications for a user"""
    return await application_service.get_applications_by_user(user_id)

@api_router.get("/campaigns/{campaign_id}/applications", response_model=List[Application])
async def get_campaign_applications(campaign_id: str):
    """Get all applications for a campaign"""
    return await application_service.get_applications_by_campaign(campaign_id)

@api_router.put("/applications/{application_id}", response_model=Application)
async def update_application(application_id: str, update_data: ApplicationUpdate):
    """Update application"""
    application = await application_service.update_application(application_id, update_data)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@api_router.get("/applications", response_model=List[Application])
async def get_recent_applications(limit: int = 10):
    """Get recent applications"""
    return await application_service.get_recent_applications(limit)

# Analytics endpoints
@api_router.get("/users/{user_id}/analytics")
async def get_user_analytics(user_id: str):
    """Get comprehensive analytics for a user"""
    try:
        return await analytics_service.get_user_analytics(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}/dashboard")
async def get_dashboard_stats(user_id: str):
    """Get dashboard statistics for a user"""
    try:
        return await analytics_service.get_dashboard_stats(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Utility endpoints
@api_router.post("/jobs/expire")
async def expire_old_jobs():
    """Expire jobs past their 3-hour window"""
    try:
        expired_count = await job_service.expire_old_jobs()
        return {"message": f"Expired {expired_count} jobs"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Service endpoints
@api_router.get("/ai/models")
async def get_available_ai_models():
    """Get available AI models for user selection"""
    try:
        models = await ai_service.get_available_models()
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}/ai/preferences")
async def get_user_ai_preferences(user_id: str):
    """Get user's AI provider preferences"""
    try:
        preferences = await ai_service.get_user_ai_preferences(user_id)
        return preferences
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/{user_id}/ai/preferences")
async def set_user_ai_preferences(user_id: str, preferences: dict):
    """Set user's AI provider preferences"""
    try:
        provider = preferences.get('provider')
        model = preferences.get('model')
        
        if not provider or not model:
            raise HTTPException(status_code=400, detail="Provider and model are required")
        
        success = await ai_service.set_user_ai_preferences(user_id, provider, model)
        if success:
            return {"message": "AI preferences updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update preferences")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/{user_id}/ai/generate-cover-letter")
async def generate_cover_letter(user_id: str, request_data: dict):
    """Generate AI-powered cover letter for a job"""
    try:
        job_id = request_data.get('job_id')
        provider = request_data.get('provider')
        model = request_data.get('model')
        
        if not job_id:
            raise HTTPException(status_code=400, detail="Job ID is required")
        
        # Get user profile
        user_profile = await user_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Get job details
        job = await job_service.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Generate cover letter
        result = await ai_service.generate_cover_letter(
            user_id, 
            user_profile.dict(), 
            job.dict(),
            provider,
            model
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/{user_id}/ai/generate-resume-summary")
async def generate_resume_summary(user_id: str, request_data: dict):
    """Generate AI-powered resume summary for a job"""
    try:
        job_id = request_data.get('job_id')
        provider = request_data.get('provider')
        model = request_data.get('model')
        
        if not job_id:
            raise HTTPException(status_code=400, detail="Job ID is required")
        
        # Get user profile
        user_profile = await user_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Get job details
        job = await job_service.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Generate resume summary
        result = await ai_service.customize_resume_summary(
            user_id, 
            user_profile.dict(), 
            job.dict(),
            provider,
            model
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/{user_id}/ai/generate-linkedin-message")
async def generate_linkedin_message(user_id: str, request_data: dict):
    """Generate AI-powered LinkedIn message for a job"""
    try:
        job_id = request_data.get('job_id')
        provider = request_data.get('provider')
        model = request_data.get('model')
        
        if not job_id:
            raise HTTPException(status_code=400, detail="Job ID is required")
        
        # Get user profile
        user_profile = await user_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Get job details
        job = await job_service.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Generate LinkedIn message
        result = await ai_service.generate_linkedin_message(
            user_id, 
            user_profile.dict(), 
            job.dict(),
            provider,
            model
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}/ai/history")
async def get_user_ai_history(user_id: str, limit: int = 10):
    """Get user's AI-generated content history"""
    try:
        history = await ai_service.get_user_generated_content_history(user_id, limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LinkedIn Service endpoints
@api_router.get("/linkedin/auth-url")
async def get_linkedin_auth_url(state: str = None):
    """Get LinkedIn OAuth authorization URL"""
    try:
        auth_url = linkedin_service.get_auth_url(state)
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/linkedin/callback")
async def linkedin_oauth_callback(request_data: dict):
    """Handle LinkedIn OAuth callback"""
    try:
        code = request_data.get('code')
        user_id = request_data.get('user_id')
        
        if not code or not user_id:
            raise HTTPException(status_code=400, detail="Code and user_id are required")
        
        # Exchange code for token
        token_data = await linkedin_service.exchange_code_for_token(code)
        
        # Store token for user
        success = await linkedin_service.store_user_access_token(
            user_id,
            token_data['access_token'],
            token_data.get('expires_in', 3600)
        )
        
        if success:
            return {"message": "LinkedIn authentication successful", "token_data": token_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to store access token")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}/linkedin/profile")
async def get_linkedin_profile(user_id: str):
    """Get user's LinkedIn profile"""
    try:
        profile = await linkedin_service.get_user_profile(user_id)
        if profile:
            return profile
        else:
            raise HTTPException(status_code=404, detail="LinkedIn profile not found or token expired")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/{user_id}/linkedin/search-jobs")
async def search_linkedin_jobs(user_id: str, search_params: dict):
    """Search for jobs on LinkedIn"""
    try:
        keywords = search_params.get('keywords', '')
        location = search_params.get('location', '')
        
        # Try LinkedIn API first
        jobs = await linkedin_service.search_jobs_basic(user_id, keywords, location)
        
        # If API returns empty or fails, use demo data
        if not jobs:
            campaign_id = search_params.get('campaign_id', 'demo_campaign')
            keywords_list = keywords.split(',') if keywords else ['Product Manager']
            jobs = await linkedin_service.create_mock_jobs_for_demo(campaign_id, keywords_list)
        
        return {"jobs": jobs, "count": len(jobs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/{user_id}/linkedin/apply")
async def apply_to_linkedin_job(user_id: str, application_data: dict):
    """Apply to a LinkedIn job"""
    try:
        job_id = application_data.get('job_id')
        cover_letter = application_data.get('cover_letter', '')
        
        if not job_id:
            raise HTTPException(status_code=400, detail="Job ID is required")
        
        # Try LinkedIn API application
        success = await linkedin_service.submit_job_application(user_id, job_id, cover_letter)
        
        # If API fails, simulate application for demo
        if not success:
            result = await linkedin_service.simulate_application_process(user_id, job_id)
            return result
        
        return {"success": True, "message": "Application submitted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/linkedin/rate-limit")
async def get_linkedin_rate_limit():
    """Get current LinkedIn API rate limit status"""
    try:
        status = await linkedin_service.get_rate_limit_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
