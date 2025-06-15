from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    title: str
    company: str
    location: str
    salary: Optional[str] = None
    posted_at: datetime
    application_deadline: datetime
    status: str = "monitoring"  # monitoring, applied, customizing, expired
    match_score: float = 0.0  # 0-100
    urgency: str = "medium"  # low, medium, high, critical
    description: str = ""
    requirements: List[str] = []
    linkedin_job_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    company_linkedin_url: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class JobCreate(BaseModel):
    campaign_id: str
    title: str
    company: str
    location: str
    salary: Optional[str] = None
    posted_at: datetime
    description: str = ""
    requirements: List[str] = []
    linkedin_job_id: Optional[str] = None
    linkedin_url: Optional[str] = None

class JobUpdate(BaseModel):
    status: Optional[str] = None
    match_score: Optional[float] = None
    urgency: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None