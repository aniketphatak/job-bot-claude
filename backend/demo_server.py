#!/usr/bin/env python3
"""
JobBot Demo Server - Local Development Version
==============================================

This is a simplified version of the JobBot server for local demo purposes.
It uses mock data instead of requiring MongoDB setup.
"""

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
import uuid
import jwt
from passlib.context import CryptContext
import os
from pydantic import BaseModel

app = FastAPI(title="JobBot Demo API", version="1.0.0-demo")

# Authentication setup
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours for easier testing

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user storage for demo
USERS_DB = {}
USER_COUNTER = 1

# Pre-seed Aniket's account
def seed_default_user():
    global USER_COUNTER
    
    # Create Aniket's user account
    user_id = "aniket_user_1"
    aniket_user = {
        "id": user_id,
        "personal_info": {
            "full_name": "Aniket Phatak",
            "email": "phatakaniket@gmail.com",
            "phone": "+1-408-555-0123",
            "linkedin_url": "https://linkedin.com/in/aniketphatak",
            "portfolio_url": "",
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
        "education": [
            {
                "degree": "MS Computer Science",
                "school": "Stanford University",
                "graduation_year": "2018"
            }
        ],
        "skills": [
            "Voice AI", "Product Strategy", "Automotive Technology", "Machine Learning",
            "Product Management", "Data Analytics", "User Experience", "A/B Testing",
            "Cross-Platform Development", "API Design", "Agile Methodologies"
        ],
        "certifications": [],
        "preferences": {
            "min_salary": 200000,
            "max_salary": 350000,
            "work_arrangement": "hybrid",
            "willingness_to_relocate": False
        },
        "resumes": [],
        "password_hash": get_password_hash("testtest"),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    USERS_DB[user_id] = aniket_user
    USER_COUNTER = 2
    print(f"✅ Pre-seeded user: {aniket_user['personal_info']['email']}")

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Seed the default user on startup
seed_default_user()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = USERS_DB.get(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

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
        "companies": ["Google", "Meta", "Apple", "Microsoft", "Tesla", "OpenAI"],
        "keywords": ["AI", "Product", "Voice", "Automotive", "Machine Learning"],
        "locations": ["San Francisco", "Seattle", "Remote"],
        "experience_level": "Senior",
        "salary_range": "$200k - $350k",
        "applications_submitted": 23,
        "responses": 4,
        "interviews": 2,
        "status": "active",
        "created_at": (datetime.utcnow() - timedelta(days=7)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_activity": datetime.utcnow().isoformat()
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
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user owns this profile or allow access to own profile
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Return user data without password hash
    return {k: v for k, v in current_user.items() if k != "password_hash"}

@app.put("/api/users/{user_id}")
async def update_user_profile(user_id: str, profile_data: dict, current_user: dict = Depends(get_current_user)):
    # Check if user owns this profile
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update user data (excluding password_hash and id)
    for key, value in profile_data.items():
        if key not in ["password_hash", "id"]:
            current_user[key] = value
    
    current_user["updated_at"] = datetime.utcnow().isoformat()
    
    return {k: v for k, v in current_user.items() if k != "password_hash"}

@app.get("/api/users")
async def list_users():
    # For demo purposes, return mock data
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

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    global USER_COUNTER
    
    # Check if user already exists
    for existing_user in USERS_DB.values():
        if existing_user["personal_info"]["email"] == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = f"user_{USER_COUNTER}"
    USER_COUNTER += 1
    
    new_user = {
        "id": user_id,
        "personal_info": {
            "full_name": user_data.full_name,
            "email": user_data.email,
            "phone": "",
            "linkedin_url": "",
            "portfolio_url": "",
            "location": ""
        },
        "experience": [],
        "education": [],
        "skills": [],
        "certifications": [],
        "preferences": {
            "min_salary": "",
            "max_salary": "",
            "work_arrangement": "hybrid",
            "willingness_to_relocate": False
        },
        "resume_file": None,
        "password_hash": get_password_hash(user_data.password),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    USERS_DB[user_id] = new_user
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    # Return user data without password hash
    user_response = {k: v for k, v in new_user.items() if k != "password_hash"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user by email
    user = None
    for u in USERS_DB.values():
        if u["personal_info"]["email"] == user_data.email:
            user = u
            break
    
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    # Return user data without password hash
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.get("/api/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user": {k: v for k, v in current_user.items() if k != "password_hash"}}

# Resume upload endpoint with versioning
@app.post("/api/users/{user_id}/resume")
async def upload_resume(
    user_id: str, 
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Check if user owns this profile
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are allowed")
    
    # Read file content to get size
    content = await file.read()
    file_size = len(content)
    
    # Validate file size (5MB limit)
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
    
    # Parse resume content
    parsed_data = await parse_resume_content(content, file.filename)
    
    # Create resume record (single resume per user)
    resume_info = {
        "id": "user_resume",
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file_size,
        "uploaded_at": datetime.utcnow().isoformat(),
        "is_active": True,
        "parsed_data": parsed_data
    }
    
    # Replace any existing resume with the new one
    current_user["resumes"] = [resume_info]
    current_user["updated_at"] = datetime.utcnow().isoformat()
    
    # Update user profile with parsed data
    if parsed_data:
        await update_profile_from_resume(current_user, parsed_data)
    
    return {"success": True, "resume": resume_info}

async def parse_resume_content(content: bytes, filename: str):
    """Mock resume parsing - in production would use AI/ML service"""
    # Simulate parsing different file types
    file_ext = filename.lower().split('.')[-1]
    
    # Mock extracted data based on filename patterns
    if "senior" in filename.lower() or "lead" in filename.lower():
        return {
            "personal_info": {
                "full_name": "John Doe",
                "email": "john.doe@email.com",
                "phone": "+1-555-0123",
                "location": "San Francisco, CA"
            },
            "experience": [
                {
                    "title": "Senior Product Manager",
                    "company": "Tech Corp",
                    "start_date": "2020-01",
                    "end_date": "present",
                    "description": "Led product strategy and development for AI-powered solutions"
                }
            ],
            "skills": ["Product Management", "AI/ML", "Data Analysis", "Leadership", "Strategy"],
            "education": [
                {
                    "degree": "MBA",
                    "school": "Stanford University", 
                    "graduation_year": "2019"
                }
            ]
        }
    else:
        return {
            "personal_info": {
                "full_name": "Jane Smith",
                "email": "jane.smith@email.com", 
                "phone": "+1-555-0456",
                "location": "New York, NY"
            },
            "experience": [
                {
                    "title": "Software Engineer",
                    "company": "Startup Inc",
                    "start_date": "2021-06", 
                    "end_date": "present",
                    "description": "Developed web applications using React and Node.js"
                }
            ],
            "skills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
            "education": [
                {
                    "degree": "BS Computer Science",
                    "school": "UC Berkeley",
                    "graduation_year": "2021"  
                }
            ]
        }

async def update_profile_from_resume(user: dict, parsed_data: dict):
    """Update user profile with parsed resume data"""
    # Update personal info if not already filled
    for key, value in parsed_data.get("personal_info", {}).items():
        if not user.get("personal_info", {}).get(key):
            if "personal_info" not in user:
                user["personal_info"] = {}
            user["personal_info"][key] = value
    
    # Merge experience 
    if parsed_data.get("experience"):
        if "experience" not in user:
            user["experience"] = []
        for exp in parsed_data["experience"]:
            # Add if not already exists
            if not any(e.get("title") == exp.get("title") and 
                      e.get("company") == exp.get("company") for e in user["experience"]):
                user["experience"].append(exp)
    
    # Merge skills
    if parsed_data.get("skills"):
        if "skills" not in user:
            user["skills"] = []
        for skill in parsed_data["skills"]:
            if skill not in user["skills"]:
                user["skills"].append(skill)
    
    # Merge education
    if parsed_data.get("education"):
        if "education" not in user:
            user["education"] = []
        for edu in parsed_data["education"]:
            # Add if not already exists
            if not any(e.get("degree") == edu.get("degree") and 
                      e.get("school") == edu.get("school") for e in user["education"]):
                user["education"].append(edu)

@app.get("/api/users/{user_id}/resumes")
async def get_resumes(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Check if user owns this profile
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resumes = current_user.get("resumes", [])
    return {"resumes": resumes}

@app.delete("/api/users/{user_id}/resume/{resume_id}")
async def delete_resume(
    user_id: str,
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Check if user owns this profile
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Clear the user's resume
    current_user["resumes"] = []
    current_user["updated_at"] = datetime.utcnow().isoformat()
    
    return {"success": True, "message": "Resume deleted"}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting JobBot Demo Server...")
    print("📊 Dashboard: http://localhost:3000")
    print("🔗 API Docs: http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)