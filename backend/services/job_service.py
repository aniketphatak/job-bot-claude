import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorDatabase
from models.job import Job, JobCreate, JobUpdate
from typing import Optional, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.jobs

    async def create_job(self, job_data: JobCreate) -> Job:
        """Create a new job"""
        try:
            # Ensure posted_at is timezone-naive
            posted_at = job_data.posted_at
            if posted_at.tzinfo is not None:
                posted_at = posted_at.replace(tzinfo=None)
            
            # Calculate application deadline (3 hours from posted time)
            deadline = posted_at + timedelta(hours=3)
            
            job_dict = job_data.dict()
            job_dict['posted_at'] = posted_at
            job_dict['application_deadline'] = deadline
            
            # Calculate match score and urgency
            job_dict['match_score'] = await self._calculate_match_score(job_data)
            job_dict['urgency'] = await self._calculate_urgency(deadline)
            
            job = Job(**job_dict)
            result = await self.collection.insert_one(job.dict())
            job.id = str(result.inserted_id) if result.inserted_id else job.id
            logger.info(f"Created job: {job.id}")
            return job
        except Exception as e:
            logger.error(f"Error creating job: {e}")
            raise

    async def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID"""
        try:
            job_data = await self.collection.find_one({"id": job_id})
            if job_data:
                job_data.pop('_id', None)
                return Job(**job_data)
            return None
        except Exception as e:
            logger.error(f"Error getting job {job_id}: {e}")
            raise

    async def get_jobs_by_campaign(self, campaign_id: str) -> List[Job]:
        """Get all jobs for a campaign"""
        try:
            jobs = []
            async for job_data in self.collection.find({"campaign_id": campaign_id}):
                job_data.pop('_id', None)
                jobs.append(Job(**job_data))
            return jobs
        except Exception as e:
            logger.error(f"Error getting jobs for campaign {campaign_id}: {e}")
            raise

    async def get_active_jobs(self, limit: int = 50) -> List[Job]:
        """Get active jobs (within 3-hour window)"""
        try:
            now = datetime.utcnow()
            jobs = []
            async for job_data in self.collection.find({
                "status": "monitoring",
                "application_deadline": {"$gte": now}
            }).sort("application_deadline", 1).limit(limit):
                job_data.pop('_id', None)
                jobs.append(Job(**job_data))
            return jobs
        except Exception as e:
            logger.error(f"Error getting active jobs: {e}")
            raise

    async def update_job(self, job_id: str, update_data: JobUpdate) -> Optional[Job]:
        """Update job"""
        try:
            update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
            update_dict['updated_at'] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"id": job_id},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                return await self.get_job(job_id)
            return None
        except Exception as e:
            logger.error(f"Error updating job {job_id}: {e}")
            raise

    async def mark_job_as_applied(self, job_id: str) -> bool:
        """Mark job as applied"""
        try:
            result = await self.collection.update_one(
                {"id": job_id},
                {"$set": {"status": "applied", "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error marking job as applied {job_id}: {e}")
            raise

    async def expire_old_jobs(self) -> int:
        """Mark expired jobs (past 3-hour window)"""
        try:
            now = datetime.utcnow()
            result = await self.collection.update_many(
                {
                    "status": "monitoring",
                    "application_deadline": {"$lt": now}
                },
                {"$set": {"status": "expired", "updated_at": now}}
            )
            if result.modified_count > 0:
                logger.info(f"Expired {result.modified_count} jobs")
            return result.modified_count
        except Exception as e:
            logger.error(f"Error expiring old jobs: {e}")
            raise

    async def _calculate_match_score(self, job_data: JobCreate) -> float:
        """Calculate job match score based on various factors"""
        # Simplified scoring logic - in production, this would be more sophisticated
        score = 75.0  # Base score
        
        # Add points for salary mention
        if job_data.salary:
            score += 5.0
            
        # Add points for remote/hybrid flexibility
        if any(keyword in job_data.description.lower() for keyword in ['remote', 'hybrid', 'flexible']):
            score += 10.0
            
        # Add points based on requirements match (simplified)
        if job_data.requirements:
            score += min(len(job_data.requirements) * 2, 10)
            
        return min(score, 100.0)

    async def _calculate_urgency(self, deadline: datetime) -> str:
        """Calculate urgency based on time until deadline"""
        now = datetime.utcnow()
        # Ensure both datetimes are timezone-naive for comparison
        if deadline.tzinfo is not None:
            deadline = deadline.replace(tzinfo=None)
        
        time_left = deadline - now
        hours_left = time_left.total_seconds() / 3600
        
        if hours_left <= 0:
            return "expired"
        elif hours_left <= 1:
            return "critical"
        elif hours_left <= 2:
            return "high"
        else:
            return "medium"