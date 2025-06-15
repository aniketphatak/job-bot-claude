import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserProfile, UserProfileCreate, UserProfileUpdate
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.user_profiles

    async def create_user_profile(self, profile_data: UserProfileCreate) -> UserProfile:
        """Create a new user profile"""
        try:
            profile = UserProfile(**profile_data.dict())
            result = await self.collection.insert_one(profile.dict())
            profile.id = str(result.inserted_id) if result.inserted_id else profile.id
            logger.info(f"Created user profile: {profile.id}")
            return profile
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            raise

    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID"""
        try:
            profile_data = await self.collection.find_one({"id": user_id})
            if profile_data:
                profile_data.pop('_id', None)
                return UserProfile(**profile_data)
            return None
        except Exception as e:
            logger.error(f"Error getting user profile {user_id}: {e}")
            raise

    async def update_user_profile(self, user_id: str, update_data: UserProfileUpdate) -> Optional[UserProfile]:
        """Update user profile"""
        try:
            update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
            update_dict['updated_at'] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"id": user_id},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                return await self.get_user_profile(user_id)
            return None
        except Exception as e:
            logger.error(f"Error updating user profile {user_id}: {e}")
            raise

    async def delete_user_profile(self, user_id: str) -> bool:
        """Delete user profile"""
        try:
            result = await self.collection.delete_one({"id": user_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting user profile {user_id}: {e}")
            raise

    async def list_user_profiles(self) -> List[UserProfile]:
        """List all user profiles"""
        try:
            profiles = []
            async for profile_data in self.collection.find():
                profile_data.pop('_id', None)
                profiles.append(UserProfile(**profile_data))
            return profiles
        except Exception as e:
            logger.error(f"Error listing user profiles: {e}")
            raise