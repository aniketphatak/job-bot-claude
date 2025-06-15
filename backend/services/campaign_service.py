import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorDatabase
from models.campaign import JobSearchCampaign, JobSearchCampaignCreate, JobSearchCampaignUpdate
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class CampaignService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.job_search_campaigns

    async def create_campaign(self, campaign_data: JobSearchCampaignCreate) -> JobSearchCampaign:
        """Create a new job search campaign"""
        try:
            campaign = JobSearchCampaign(**campaign_data.dict())
            result = await self.collection.insert_one(campaign.dict())
            campaign.id = str(result.inserted_id) if result.inserted_id else campaign.id
            logger.info(f"Created campaign: {campaign.id}")
            return campaign
        except Exception as e:
            logger.error(f"Error creating campaign: {e}")
            raise

    async def get_campaign(self, campaign_id: str) -> Optional[JobSearchCampaign]:
        """Get campaign by ID"""
        try:
            campaign_data = await self.collection.find_one({"id": campaign_id})
            if campaign_data:
                campaign_data.pop('_id', None)
                return JobSearchCampaign(**campaign_data)
            return None
        except Exception as e:
            logger.error(f"Error getting campaign {campaign_id}: {e}")
            raise

    async def get_campaigns_by_user(self, user_id: str) -> List[JobSearchCampaign]:
        """Get all campaigns for a user"""
        try:
            campaigns = []
            async for campaign_data in self.collection.find({"user_id": user_id}):
                campaign_data.pop('_id', None)
                campaigns.append(JobSearchCampaign(**campaign_data))
            return campaigns
        except Exception as e:
            logger.error(f"Error getting campaigns for user {user_id}: {e}")
            raise

    async def update_campaign(self, campaign_id: str, update_data: JobSearchCampaignUpdate) -> Optional[JobSearchCampaign]:
        """Update campaign"""
        try:
            update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
            update_dict['updated_at'] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"id": campaign_id},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                return await self.get_campaign(campaign_id)
            return None
        except Exception as e:
            logger.error(f"Error updating campaign {campaign_id}: {e}")
            raise

    async def delete_campaign(self, campaign_id: str) -> bool:
        """Delete campaign"""
        try:
            result = await self.collection.delete_one({"id": campaign_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting campaign {campaign_id}: {e}")
            raise

    async def update_campaign_stats(self, campaign_id: str, applications_submitted: int = None, 
                                   responses: int = None, interviews: int = None) -> bool:
        """Update campaign statistics"""
        try:
            update_data = {'last_activity': datetime.utcnow()}
            
            if applications_submitted is not None:
                update_data['applications_submitted'] = applications_submitted
            if responses is not None:
                update_data['responses'] = responses
            if interviews is not None:
                update_data['interviews'] = interviews
                
            result = await self.collection.update_one(
                {"id": campaign_id},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating campaign stats {campaign_id}: {e}")
            raise

    async def get_active_campaigns(self) -> List[JobSearchCampaign]:
        """Get all active campaigns"""
        try:
            campaigns = []
            async for campaign_data in self.collection.find({"status": "active"}):
                campaign_data.pop('_id', None)
                campaigns.append(JobSearchCampaign(**campaign_data))
            return campaigns
        except Exception as e:
            logger.error(f"Error getting active campaigns: {e}")
            raise