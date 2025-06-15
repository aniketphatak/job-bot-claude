from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime, date

class DailyStats(BaseModel):
    date: date
    applications_submitted: int = 0
    responses_received: int = 0
    interviews_scheduled: int = 0

class CampaignAnalytics(BaseModel):
    campaign_id: str
    campaign_name: str
    applications_submitted: int
    response_rate: float
    interview_rate: float
    avg_response_time: float  # in days
    top_performing_keywords: List[str]
    daily_stats: List[DailyStats]

class UserAnalytics(BaseModel):
    user_id: str
    total_applications: int
    total_responses: int
    total_interviews: int
    overall_response_rate: float
    overall_interview_rate: float
    avg_response_time: float
    applications_by_day: List[Dict[str, Any]]
    top_performing_keywords: List[str]
    campaign_analytics: List[CampaignAnalytics]