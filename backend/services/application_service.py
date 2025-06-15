import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorDatabase
from models.application import Application, ApplicationCreate, ApplicationUpdate
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ApplicationService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.applications

    async def create_application(self, application_data: ApplicationCreate) -> Application:
        """Create a new application"""
        try:
            application = Application(**application_data.dict())
            result = await self.collection.insert_one(application.dict())
            application.id = str(result.inserted_id) if result.inserted_id else application.id
            logger.info(f"Created application: {application.id}")
            return application
        except Exception as e:
            logger.error(f"Error creating application: {e}")
            raise

    async def get_application(self, application_id: str) -> Optional[Application]:
        """Get application by ID"""
        try:
            app_data = await self.collection.find_one({"id": application_id})
            if app_data:
                app_data.pop('_id', None)
                return Application(**app_data)
            return None
        except Exception as e:
            logger.error(f"Error getting application {application_id}: {e}")
            raise

    async def get_applications_by_user(self, user_id: str) -> List[Application]:
        """Get all applications for a user"""
        try:
            applications = []
            async for app_data in self.collection.find({"user_id": user_id}).sort("submitted_at", -1):
                app_data.pop('_id', None)
                applications.append(Application(**app_data))
            return applications
        except Exception as e:
            logger.error(f"Error getting applications for user {user_id}: {e}")
            raise

    async def get_applications_by_campaign(self, campaign_id: str) -> List[Application]:
        """Get all applications for a campaign"""
        try:
            applications = []
            async for app_data in self.collection.find({"campaign_id": campaign_id}).sort("submitted_at", -1):
                app_data.pop('_id', None)
                applications.append(Application(**app_data))
            return applications
        except Exception as e:
            logger.error(f"Error getting applications for campaign {campaign_id}: {e}")
            raise

    async def update_application(self, application_id: str, update_data: ApplicationUpdate) -> Optional[Application]:
        """Update application"""
        try:
            update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
            update_dict['updated_at'] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"id": application_id},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                return await self.get_application(application_id)
            return None
        except Exception as e:
            logger.error(f"Error updating application {application_id}: {e}")
            raise

    async def get_recent_applications(self, limit: int = 10) -> List[Application]:
        """Get recent applications across all users"""
        try:
            applications = []
            async for app_data in self.collection.find().sort("submitted_at", -1).limit(limit):
                app_data.pop('_id', None)
                applications.append(Application(**app_data))
            return applications
        except Exception as e:
            logger.error(f"Error getting recent applications: {e}")
            raise

    async def get_application_by_job(self, job_id: str) -> Optional[Application]:
        """Get application for a specific job"""
        try:
            app_data = await self.collection.find_one({"job_id": job_id})
            if app_data:
                app_data.pop('_id', None)
                return Application(**app_data)
            return None
        except Exception as e:
            logger.error(f"Error getting application for job {job_id}: {e}")
            raise

    async def count_applications_by_status(self, user_id: str) -> dict:
        """Count applications by status for a user"""
        try:
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": "$status", "count": {"$sum": 1}}}
            ]
            
            result = {}
            async for doc in self.collection.aggregate(pipeline):
                result[doc["_id"]] = doc["count"]
                
            return result
        except Exception as e:
            logger.error(f"Error counting applications by status for user {user_id}: {e}")
            raise