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

class AutomationSettings(BaseModel):
    enabled: bool = False  # Master switch for automation
    auto_apply_enabled: bool = False  # Enable automatic job applications
    daily_application_limit: int = 10  # Max applications per day
    min_match_score: float = 0.75  # Minimum match score (0-1) to auto-apply
    urgency_levels: List[str] = ["critical", "high"]  # Which urgency levels to auto-apply
    approval_mode: str = "review_before_apply"  # "auto" or "review_before_apply"
    excluded_companies: List[str] = []  # Companies to never apply to (e.g., current employer)
    required_keywords: List[str] = []  # Must have these keywords to auto-apply
    excluded_keywords: List[str] = []  # Exclude jobs with these keywords
    auto_generate_content: bool = True  # Auto-generate cover letters and resume summaries
    notification_email: Optional[str] = None  # Email for application notifications
    last_auto_apply_date: Optional[datetime] = None  # Track daily limit reset
    applications_today: int = 0  # Counter for daily limit

class Resume(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_name: str
    file_size: int  # bytes
    content_base64: str
    is_primary: bool = False  # Primary resume for auto-apply
    parsed_data: Optional[Dict[str, Any]] = None  # Extracted skills, experience, etc.
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0"

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    personal_info: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    certifications: List[str] = []
    preferences: UserPreferences = UserPreferences()
    automation_settings: AutomationSettings = AutomationSettings()
    resumes: List[Resume] = []  # Support multiple resume versions
    resume_file_path: Optional[str] = None  # Legacy field, deprecated
    resume_base64: Optional[str] = None  # Legacy field, deprecated
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
    automation_settings: Optional[AutomationSettings] = None
    resume_base64: Optional[str] = None

class AutomationSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    auto_apply_enabled: Optional[bool] = None
    daily_application_limit: Optional[int] = None
    min_match_score: Optional[float] = None
    urgency_levels: Optional[List[str]] = None
    approval_mode: Optional[str] = None
    excluded_companies: Optional[List[str]] = None
    required_keywords: Optional[List[str]] = None
    excluded_keywords: Optional[List[str]] = None
    auto_generate_content: Optional[bool] = None
    notification_email: Optional[str] = None