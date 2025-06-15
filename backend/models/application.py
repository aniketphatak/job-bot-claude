from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ApplicationResponse(BaseModel):
    type: str  # interview_request, rejection, follow_up
    received_at: datetime
    message: str
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None

class Application(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    campaign_id: str
    user_id: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "submitted"  # submitted, response_received, interview_scheduled, rejected, withdrawn
    custom_resume_base64: Optional[str] = None
    cover_letter: Optional[str] = None
    linkedin_message: Optional[str] = None
    ai_confidence: float = 0.0  # 0-1
    response: Optional[ApplicationResponse] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ApplicationCreate(BaseModel):
    job_id: str
    campaign_id: str
    user_id: str
    custom_resume_base64: Optional[str] = None
    cover_letter: Optional[str] = None
    linkedin_message: Optional[str] = None
    ai_confidence: float = 0.0

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    response: Optional[ApplicationResponse] = None
    notes: Optional[str] = None