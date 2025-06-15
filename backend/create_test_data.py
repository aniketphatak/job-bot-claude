#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timezone

BASE_URL = "http://localhost:8001/api"

def create_test_data():
    """Create comprehensive test data for JobBot"""
    
    # 1. Create a user profile
    user_data = {
        "personal_info": {
            "full_name": "Alex Johnson",
            "email": "alex.johnson@email.com",
            "phone": "+1 (555) 123-4567",
            "linkedin_url": "https://linkedin.com/in/alexjohnson",
            "portfolio_url": "https://alexjohnson.dev",
            "location": "San Francisco, CA"
        },
        "experience": [
            {
                "title": "Senior Product Manager",
                "company": "TechCorp",
                "start_date": "2022-03",
                "end_date": "present",
                "description": "Led product strategy for core platform serving 10M+ users"
            },
            {
                "title": "Product Manager",
                "company": "StartupXYZ",
                "start_date": "2020-01",
                "end_date": "2022-02",
                "description": "Launched three major features resulting in 40% user growth"
            }
        ],
        "education": [
            {
                "degree": "MBA",
                "school": "Stanford Graduate School of Business",
                "graduation_year": "2020"
            },
            {
                "degree": "BS Computer Science",
                "school": "UC Berkeley",
                "graduation_year": "2016"
            }
        ],
        "skills": ["Product Strategy", "Data Analysis", "User Research", "A/B Testing", "SQL", "Python"],
        "certifications": ["Google Analytics", "Scrum Master"],
        "preferences": {
            "min_salary": 150000,
            "max_salary": 250000,
            "work_arrangement": "hybrid",
            "willingness_to_relocate": False
        }
    }
    
    print("Creating user profile...")
    response = requests.post(f"{BASE_URL}/users", json=user_data)
    user = response.json()
    user_id = user["id"]
    print(f"Created user: {user_id}")
    
    # 2. Create campaigns
    campaigns_data = [
        {
            "user_id": user_id,
            "name": "Senior Product Manager - Tech",
            "keywords": ["Product Manager", "Senior PM", "Product Strategy"],
            "companies": ["Google", "Meta", "Apple", "Microsoft", "Amazon"],
            "locations": ["San Francisco", "Seattle", "Remote"],
            "experience_level": "Senior",
            "salary_range": "$150k - $250k"
        },
        {
            "user_id": user_id,
            "name": "VP Product - Fintech",
            "keywords": ["VP Product", "Head of Product", "Product Director"],
            "companies": ["Stripe", "Square", "Coinbase", "Robinhood"],
            "locations": ["New York", "San Francisco", "Remote"],
            "experience_level": "Executive",
            "salary_range": "$200k - $350k"
        }
    ]
    
    campaign_ids = []
    for campaign_data in campaigns_data:
        print(f"Creating campaign: {campaign_data['name']}")
        response = requests.post(f"{BASE_URL}/campaigns", json=campaign_data)
        campaign = response.json()
        campaign_ids.append(campaign["id"])
        print(f"Created campaign: {campaign['id']}")
    
    # 3. Create jobs
    now = datetime.now(timezone.utc)
    jobs_data = [
        {
            "campaign_id": campaign_ids[0],
            "title": "Senior Product Manager",
            "company": "Meta",
            "location": "San Francisco, CA",
            "salary": "$180k - $220k",
            "posted_at": now.isoformat(),
            "description": "Lead product strategy for our core social platform. You'll work with cross-functional teams to drive product decisions that impact billions of users.",
            "requirements": ["5+ years PM experience", "B2C product experience", "Data-driven approach"],
            "linkedin_job_id": "meta-spm-123",
            "linkedin_url": "https://linkedin.com/jobs/meta-spm-123"
        },
        {
            "campaign_id": campaign_ids[0],
            "title": "Product Manager - Growth",
            "company": "Stripe",
            "location": "Remote",
            "salary": "$160k - $200k",
            "posted_at": now.isoformat(),
            "description": "Drive growth initiatives across our payment platform. Lead experiments and optimize conversion funnels.",
            "requirements": ["3+ years PM experience", "Growth/experimentation background", "Technical aptitude"],
            "linkedin_job_id": "stripe-pmg-456",
            "linkedin_url": "https://linkedin.com/jobs/stripe-pmg-456"
        },
        {
            "campaign_id": campaign_ids[1],
            "title": "VP of Product",
            "company": "Robinhood",
            "location": "New York, NY",
            "salary": "$250k - $300k",
            "posted_at": now.isoformat(),
            "description": "Lead product organization for our trading platform. Shape the future of democratized finance.",
            "requirements": ["8+ years product leadership", "Fintech experience", "Team management"],
            "linkedin_job_id": "robinhood-vp-789",
            "linkedin_url": "https://linkedin.com/jobs/robinhood-vp-789"
        }
    ]
    
    job_ids = []
    for job_data in jobs_data:
        print(f"Creating job: {job_data['title']} at {job_data['company']}")
        response = requests.post(f"{BASE_URL}/jobs", json=job_data)
        if response.status_code == 200:
            job = response.json()
            job_ids.append(job["id"])
            print(f"Created job: {job['id']}")
        else:
            print(f"Failed to create job: {response.text}")
    
    # 4. Create applications
    for i, job_id in enumerate(job_ids[:2]):  # Apply to first 2 jobs
        application_data = {
            "job_id": job_id,
            "campaign_id": campaign_ids[0],
            "user_id": user_id,
            "cover_letter": f"Dear Hiring Manager, I am excited to apply for this position. My experience in product management makes me a strong candidate...",
            "linkedin_message": f"Hi, I just applied for the position and would love to connect...",
            "ai_confidence": 0.85 + (i * 0.05)
        }
        
        print(f"Creating application for job: {job_id}")
        response = requests.post(f"{BASE_URL}/applications", json=application_data)
        if response.status_code == 200:
            application = response.json()
            print(f"Created application: {application['id']}")
        else:
            print(f"Failed to create application: {response.text}")
    
    # 5. Update campaign stats
    update_data = {
        "applications_submitted": 23,
        "responses": 4,
        "interviews": 2
    }
    
    print("Updating campaign stats...")
    response = requests.put(f"{BASE_URL}/campaigns/{campaign_ids[0]}", json=update_data)
    if response.status_code == 200:
        print("Updated campaign stats successfully")
    
    print(f"\n✅ Test data creation completed!")
    print(f"User ID: {user_id}")
    print(f"Campaign IDs: {campaign_ids}")
    print(f"Job IDs: {job_ids}")
    
    # Test dashboard
    print("\n📊 Testing dashboard...")
    response = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
    if response.status_code == 200:
        dashboard_data = response.json()
        print(f"Dashboard data: {json.dumps(dashboard_data, indent=2)}")
    
    return user_id, campaign_ids, job_ids

if __name__ == "__main__":
    create_test_data()