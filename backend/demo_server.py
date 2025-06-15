#!/usr/bin/env python3
"""
JobBot Demo Server - Local Development Version
==============================================

This is a simplified version of the JobBot server for local demo purposes.
It uses mock data instead of requiring MongoDB setup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import json
from datetime import datetime, timedelta
import uuid

app = FastAPI(title="JobBot Demo API", version="1.0.0-demo")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_USER = {
    "id": "demo_user_1",
    "personal_info": {
        "full_name": "Aniket Phatak",
        "email": "phatakaniket@gmail.com",
        "phone": "+1-555-0123",
        "linkedin_url": "https://linkedin.com/in/aniketphatak",
        "location": "Milpitas, CA 95035"
    },
    "experience": [
        {
            "title": "Product Lead",
            "company": "Amazon",
            "start_date": "2020-01",
            "end_date": "present",
            "description": "Leading Voice AI and Automotive products for 300,000+ vehicles across 30+ brands"
        },
        {
            "title": "Senior Product Manager",
            "company": "Audible",
            "start_date": "2018-03",
            "end_date": "2020-01",
            "description": "Scaled Audio on Auto to 315K MAUs with 60% YoY growth"
        }
    ],
    "skills": [
        "Voice AI", "Product Strategy", "Automotive Technology", "Machine Learning",
        "Product Management", "Data Analytics", "User Experience", "A/B Testing",
        "Cross-Platform Development", "API Design", "Agile Methodologies"
    ],
    "education": [
        {
            "degree": "MS Computer Science",
            "school": "Stanford University",
            "graduation_year": "2018"
        }
    ],
    "preferences": {
        "min_salary": 200000,
        "max_salary": 350000,
        "work_arrangement": "hybrid",
        "willingness_to_relocate": False
    },
    "created_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat()
}

MOCK_CAMPAIGNS = [
    {
        "id": "campaign_1",
        "user_id": "demo_user_1",
        "name": "Senior Product Leadership - AI/Tech",
        "target_roles": ["Senior Product Manager", "Principal PM", "Director Product", "VP Product"],
        "target_companies": ["Google", "Meta", "Apple", "Microsoft", "Tesla", "OpenAI"],
        "keywords": ["AI", "Product", "Voice", "Automotive", "Machine Learning"],
        "salary_range": {"min": 200000, "max": 350000},
        "status": "active",
        "created_at": (datetime.utcnow() - timedelta(days=7)).isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
]

MOCK_JOBS = [
    {
        "id": "job_1",
        "campaign_id": "campaign_1",
        "title": "Senior Product Manager - Voice AI",
        "company": "Google",
        "location": "Mountain View, CA",
        "description": "Lead voice AI products and strategy for Google Assistant",
        "requirements": ["5+ years PM experience", "Voice AI background", "Technical depth"],
        "salary_range": {"min": 220000, "max": 320000},
        "posted_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
        "urgency": "high",
        "match_score": 95,
        "status": "active"
    },
    {
        "id": "job_2", 
        "campaign_id": "campaign_1",
        "title": "Principal Product Manager - Automotive",
        "company": "Tesla",
        "location": "Palo Alto, CA",
        "description": "Drive product strategy for in-vehicle entertainment systems",
        "requirements": ["7+ years PM experience", "Automotive experience", "AI/ML knowledge"],
        "salary_range": {"min": 250000, "max": 350000},
        "posted_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "urgency": "high",
        "match_score": 92,
        "status": "active"
    }
]

MOCK_ANALYTICS = {
    "total_applications": 15,
    "active_campaigns": 1,
    "jobs_found": 2,
    "response_rate": 23.5,
    "applications_this_week": 3,
    "interviews_scheduled": 2,
    "avg_match_score": 93.5
}

# API Routes
@app.get("/api/")
async def root():
    return {"message": "JobBot Demo API is running!", "version": "1.0.0-demo"}

@app.get("/api/users/{user_id}")
async def get_user_profile(user_id: str):
    return MOCK_USER

@app.get("/api/users")
async def list_users():
    return [MOCK_USER]

@app.get("/api/users/{user_id}/campaigns")
async def get_user_campaigns(user_id: str):
    return MOCK_CAMPAIGNS

@app.get("/api/campaigns")
async def get_campaigns():
    return MOCK_CAMPAIGNS

@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    return MOCK_CAMPAIGNS[0]

@app.get("/api/campaigns/{campaign_id}/jobs")
async def get_campaign_jobs(campaign_id: str):
    return MOCK_JOBS

@app.get("/api/jobs")
async def get_jobs(limit: int = 50):
    return MOCK_JOBS

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    return MOCK_JOBS[0] if job_id == "job_1" else MOCK_JOBS[1]

@app.get("/api/users/{user_id}/analytics")
async def get_user_analytics(user_id: str):
    return MOCK_ANALYTICS

@app.get("/api/users/{user_id}/dashboard")
async def get_dashboard_stats(user_id: str):
    return MOCK_ANALYTICS

@app.get("/api/users/{user_id}/applications")
async def get_user_applications(user_id: str):
    return [
        {
            "id": "app_1",
            "job_title": "Senior Product Manager - Voice AI",
            "company": "Google",
            "status": "response_received",
            "applied_date": "2025-06-14",
            "deadline": "2025-06-16T18:00:00Z"
        },
        {
            "id": "app_2", 
            "job_title": "Principal PM - Automotive",
            "company": "Tesla",
            "status": "applied",
            "applied_date": "2025-06-13",
            "deadline": "2025-06-15T15:00:00Z"
        }
    ]

@app.get("/api/ai/models")
async def get_ai_models():
    return {
        "openai": {
            "models": ["gpt-4o", "gpt-4o-mini"],
            "recommended": "gpt-4o"
        }
    }

@app.get("/api/users/{user_id}/ai/preferences")
async def get_ai_preferences(user_id: str):
    return {"provider": "openai", "model": "gpt-4o"}

@app.post("/api/users/{user_id}/ai/generate-cover-letter")
async def generate_cover_letter(user_id: str, request_data: dict):
    return {
        "success": True,
        "cover_letter": "Dear Hiring Manager,\n\nI am excited to apply for this position...",
        "provider": "openai",
        "model": "gpt-4o"
    }

@app.get("/api/linkedin/auth-url")
async def get_linkedin_auth_url():
    return {"auth_url": "https://linkedin.com/oauth/authorize"}

@app.get("/api/linkedin/rate-limit")
async def get_linkedin_rate_limit():
    return {"calls_made_today": 45, "daily_limit": 500}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting JobBot Demo Server...")
    print("📊 Dashboard: http://localhost:3000")
    print("🔗 API Docs: http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)