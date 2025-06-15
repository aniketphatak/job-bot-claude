from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class PersonalInfo(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    location: str

class Experience(BaseModel):
    title: str
    company: str
    start_date: str  # Format: YYYY-MM
    end_date: str  # Format: YYYY-MM or "present"
    description: str

class Education(BaseModel):
    degree: str
    school: str
    graduation_year: str

class UserPreferences(BaseModel):
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    work_arrangement: Optional[str] = "hybrid"  # remote, hybrid, onsite
    willingness_to_relocate: bool = False

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    personal_info: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    certifications: List[str] = []
    preferences: UserPreferences = UserPreferences()
    resume_file_path: Optional[str] = None
    resume_base64: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    personal_info: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    certifications: List[str] = []
    preferences: UserPreferences = UserPreferences()
    resume_base64: Optional[str] = None

class UserProfileUpdate(BaseModel):
    personal_info: Optional[PersonalInfo] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    preferences: Optional[UserPreferences] = None
    resume_base64: Optional[str] = None