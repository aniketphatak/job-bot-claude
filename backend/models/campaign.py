from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class JobSearchCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    status: str = "active"  # active, paused, completed
    keywords: List[str] = []
    companies: List[str] = []
    locations: List[str] = []
    experience_level: Optional[str] = None  # Entry, Mid, Senior, Executive
    salary_range: Optional[str] = None
    applications_submitted: int = 0
    responses: int = 0
    interviews: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

class JobSearchCampaignCreate(BaseModel):
    user_id: str
    name: str
    keywords: List[str] = []
    companies: List[str] = []
    locations: List[str] = []
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None

class JobSearchCampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    keywords: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None