"""Automated job application service with safety controls."""
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from models.application import Application, ApplicationCreate
from models.user import UserProfile, AutomationSettings
from services.application_service import ApplicationService
from services.ai_service import AIService
from services.resume_service import ResumeService
from services.linkedin_service import LinkedInService
import logging

logger = logging.getLogger(__name__)


class AutoApplyService:
    """Service for automated job applications with safety controls."""

    def __init__(self, db):
        self.db = db
        self.users_collection = db["user_profiles"]
        self.jobs_collection = db["jobs"]
        self.campaigns_collection = db["job_search_campaigns"]
        self.application_service = ApplicationService(db)
        self.ai_service = AIService(db)
        self.resume_service = ResumeService(db)
        self.linkedin_service = LinkedInService(db)

    async def evaluate_job_for_auto_apply(
        self,
        user_id: str,
        job_id: str,
        campaign_id: str
    ) -> Tuple[bool, Optional[str], Optional[float]]:
        """
        Evaluate if a job should be auto-applied to.

        Args:
            user_id: User's ID
            job_id: Job ID to evaluate
            campaign_id: Campaign ID

        Returns:
            Tuple of (should_apply: bool, reason: str, match_score: float)
        """
        # Get user profile and automation settings
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False, "User not found", None

        user_profile = UserProfile(**user)
        settings = user_profile.automation_settings

        # Check if automation is enabled
        if not settings.enabled or not settings.auto_apply_enabled:
            return False, "Auto-apply not enabled", None

        # Check daily limit
        if not await self._check_daily_limit(user_id, settings):
            return False, "Daily application limit reached", None

        # Get job details
        job = await self.jobs_collection.find_one({"id": job_id})
        if not job:
            return False, "Job not found", None

        # Check if already applied
        if await self._already_applied(user_id, job_id):
            return False, "Already applied to this job", None

        # Check company exclusion list
        company = job.get("company", "").lower()
        excluded_companies = [c.lower() for c in settings.excluded_companies]
        if any(excluded in company for excluded in excluded_companies):
            return False, f"Company '{company}' is in exclusion list", None

        # Check urgency level
        urgency = job.get("urgency", "low")
        if urgency not in settings.urgency_levels:
            return False, f"Urgency level '{urgency}' not in allowed list", None

        # Calculate match score
        match_score = job.get("match_score", 0.0)
        if match_score < settings.min_match_score:
            return False, f"Match score {match_score:.2f} below threshold {settings.min_match_score:.2f}", match_score

        # Check required keywords
        job_text = f"{job.get('title', '')} {job.get('description', '')}".lower()
        if settings.required_keywords:
            has_all_keywords = all(
                keyword.lower() in job_text
                for keyword in settings.required_keywords
            )
            if not has_all_keywords:
                return False, "Missing required keywords", match_score

        # Check excluded keywords
        if settings.excluded_keywords:
            has_excluded = any(
                keyword.lower() in job_text
                for keyword in settings.excluded_keywords
            )
            if has_excluded:
                return False, "Contains excluded keywords", match_score

        # Check approval mode
        if settings.approval_mode == "review_before_apply":
            return False, "Approval mode requires manual review", match_score

        # All checks passed
        return True, "Job meets all auto-apply criteria", match_score

    async def auto_apply_to_job(
        self,
        user_id: str,
        job_id: str,
        campaign_id: str
    ) -> Optional[Application]:
        """
        Automatically apply to a job.

        Args:
            user_id: User's ID
            job_id: Job ID to apply to
            campaign_id: Campaign ID

        Returns:
            Created Application object or None if failed
        """
        # Evaluate if should auto-apply
        should_apply, reason, match_score = await self.evaluate_job_for_auto_apply(
            user_id, job_id, campaign_id
        )

        if not should_apply:
            logger.info(f"Not auto-applying to job {job_id}: {reason}")
            return None

        logger.info(f"Auto-applying to job {job_id} for user {user_id}")

        try:
            # Get user profile
            user = await self.users_collection.find_one({"id": user_id})
            user_profile = UserProfile(**user)
            settings = user_profile.automation_settings

            # Get primary resume
            primary_resume = await self.resume_service.get_primary_resume(user_id)
            if not primary_resume:
                logger.error(f"No primary resume found for user {user_id}")
                return None

            # Generate AI content if enabled
            cover_letter = None
            if settings.auto_generate_content:
                try:
                    cover_letter_result = await self.ai_service.generate_cover_letter(
                        user_id=user_id,
                        job_id=job_id
                    )
                    cover_letter = cover_letter_result.get("content")
                except Exception as e:
                    logger.warning(f"Failed to generate cover letter: {e}")

            # Create application
            application_data = ApplicationCreate(
                job_id=job_id,
                campaign_id=campaign_id,
                user_id=user_id,
                resume_id=primary_resume.id,
                custom_resume_base64=primary_resume.content_base64,
                cover_letter=cover_letter,
                is_auto_applied=True,
                auto_apply_match_score=match_score
            )

            # Submit application via LinkedIn or other service
            # For now, we'll just create the application record
            application = await self.application_service.create_application(
                application_data.model_dump()
            )

            # Update daily counter
            await self._increment_daily_counter(user_id)

            # Update job status to "applied"
            await self.jobs_collection.update_one(
                {"id": job_id},
                {"$set": {"status": "applied"}}
            )

            logger.info(f"Successfully auto-applied to job {job_id}")
            return application

        except Exception as e:
            logger.error(f"Error auto-applying to job {job_id}: {e}")
            return None

    async def find_and_auto_apply_jobs(self, user_id: str) -> List[Application]:
        """
        Find jobs matching user's campaigns and auto-apply to eligible ones.

        Args:
            user_id: User's ID

        Returns:
            List of created Application objects
        """
        applications = []

        # Get user's active campaigns
        campaigns_cursor = self.campaigns_collection.find({
            "user_id": user_id,
            "status": "active"
        })
        campaigns = await campaigns_cursor.to_list(length=None)

        for campaign in campaigns:
            campaign_id = campaign["id"]

            # Find jobs matching this campaign that are still in urgency window
            jobs_cursor = self.jobs_collection.find({
                "campaign_id": campaign_id,
                "status": "monitoring",  # Not yet applied or expired
                "deadline": {"$gt": datetime.utcnow()}  # Still within deadline
            })
            jobs = await jobs_cursor.to_list(length=None)

            for job in jobs:
                job_id = job["id"]

                # Try to auto-apply
                application = await self.auto_apply_to_job(
                    user_id=user_id,
                    job_id=job_id,
                    campaign_id=campaign_id
                )

                if application:
                    applications.append(application)

        return applications

    async def _check_daily_limit(
        self,
        user_id: str,
        settings: AutomationSettings
    ) -> bool:
        """
        Check if user has reached daily application limit.

        Args:
            user_id: User's ID
            settings: User's automation settings

        Returns:
            True if under limit, False if limit reached
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return False

        automation_settings = user.get("automation_settings", {})
        last_apply_date = automation_settings.get("last_auto_apply_date")
        applications_today = automation_settings.get("applications_today", 0)

        # Reset counter if it's a new day
        if last_apply_date:
            last_date = datetime.fromisoformat(last_apply_date) if isinstance(last_apply_date, str) else last_apply_date
            if last_date.date() < datetime.utcnow().date():
                applications_today = 0

        return applications_today < settings.daily_application_limit

    async def _increment_daily_counter(self, user_id: str):
        """
        Increment the daily application counter.

        Args:
            user_id: User's ID
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return

        automation_settings = user.get("automation_settings", {})
        last_apply_date = automation_settings.get("last_auto_apply_date")
        applications_today = automation_settings.get("applications_today", 0)

        # Reset counter if it's a new day
        today = datetime.utcnow()
        if last_apply_date:
            last_date = datetime.fromisoformat(last_apply_date) if isinstance(last_apply_date, str) else last_apply_date
            if last_date.date() < today.date():
                applications_today = 0

        # Increment counter
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "automation_settings.applications_today": applications_today + 1,
                    "automation_settings.last_auto_apply_date": today
                }
            }
        )

    async def _already_applied(self, user_id: str, job_id: str) -> bool:
        """
        Check if user has already applied to this job.

        Args:
            user_id: User's ID
            job_id: Job ID

        Returns:
            True if already applied, False otherwise
        """
        applications_collection = self.db["applications"]
        existing = await applications_collection.find_one({
            "user_id": user_id,
            "job_id": job_id
        })
        return existing is not None

    async def get_auto_apply_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get statistics about auto-apply usage.

        Args:
            user_id: User's ID

        Returns:
            Dictionary with auto-apply statistics
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            return {}

        automation_settings = user.get("automation_settings", {})

        # Count auto-applied applications
        applications_collection = self.db["applications"]
        total_auto_applied = await applications_collection.count_documents({
            "user_id": user_id,
            "is_auto_applied": True
        })

        # Count today's applications
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = await applications_collection.count_documents({
            "user_id": user_id,
            "is_auto_applied": True,
            "submitted_at": {"$gte": today_start}
        })

        # Count auto-apply responses
        responses_count = await applications_collection.count_documents({
            "user_id": user_id,
            "is_auto_applied": True,
            "status": {"$in": ["response_received", "interview_scheduled"]}
        })

        return {
            "total_auto_applied": total_auto_applied,
            "applications_today": today_count,
            "daily_limit": automation_settings.get("daily_application_limit", 10),
            "remaining_today": max(0, automation_settings.get("daily_application_limit", 10) - today_count),
            "responses_received": responses_count,
            "response_rate": responses_count / total_auto_applied if total_auto_applied > 0 else 0.0,
            "enabled": automation_settings.get("enabled", False),
            "auto_apply_enabled": automation_settings.get("auto_apply_enabled", False)
        }
