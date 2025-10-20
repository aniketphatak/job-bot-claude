"""Background scheduler for automated job search and application."""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from services.auto_apply_service import AutoApplyService
from services.job_service import JobService
import logging

logger = logging.getLogger(__name__)


class SchedulerService:
    """Service for managing background scheduled tasks."""

    def __init__(self, db):
        self.db = db
        self.users_collection = db["user_profiles"]
        self.scheduler = AsyncIOScheduler()
        self.auto_apply_service = AutoApplyService(db)
        self.job_service = JobService(db)

    def start(self):
        """Start the scheduler."""
        logger.info("Starting scheduler service...")

        # Schedule auto-apply job search (every 15 minutes)
        self.scheduler.add_job(
            self._run_auto_apply_for_all_users,
            trigger=IntervalTrigger(minutes=15),
            id="auto_apply_job_search",
            name="Auto-apply job search",
            replace_existing=True
        )

        # Schedule job expiration check (every 30 minutes)
        self.scheduler.add_job(
            self._expire_old_jobs,
            trigger=IntervalTrigger(minutes=30),
            id="expire_old_jobs",
            name="Expire old jobs",
            replace_existing=True
        )

        # Schedule daily reset (at midnight)
        self.scheduler.add_job(
            self._reset_daily_counters,
            trigger=CronTrigger(hour=0, minute=0),
            id="reset_daily_counters",
            name="Reset daily application counters",
            replace_existing=True
        )

        self.scheduler.start()
        logger.info("Scheduler service started successfully")

    def stop(self):
        """Stop the scheduler."""
        logger.info("Stopping scheduler service...")
        self.scheduler.shutdown()
        logger.info("Scheduler service stopped")

    async def _run_auto_apply_for_all_users(self):
        """
        Run auto-apply job search for all users with automation enabled.
        """
        logger.info("Running auto-apply job search for all users...")

        try:
            # Find all users with automation enabled
            users_cursor = self.users_collection.find({
                "automation_settings.enabled": True,
                "automation_settings.auto_apply_enabled": True
            })
            users = await users_cursor.to_list(length=None)

            total_applications = 0
            for user in users:
                user_id = user["id"]
                logger.info(f"Running auto-apply for user {user_id}")

                try:
                    applications = await self.auto_apply_service.find_and_auto_apply_jobs(user_id)
                    total_applications += len(applications)

                    if applications:
                        logger.info(f"Auto-applied to {len(applications)} jobs for user {user_id}")

                except Exception as e:
                    logger.error(f"Error running auto-apply for user {user_id}: {e}")

            logger.info(f"Auto-apply job search completed. Total applications: {total_applications}")

        except Exception as e:
            logger.error(f"Error in auto-apply job search: {e}")

    async def _expire_old_jobs(self):
        """
        Mark jobs past their 3-hour deadline as expired.
        """
        logger.info("Checking for expired jobs...")

        try:
            expired_count = await self.job_service.expire_old_jobs()
            if expired_count > 0:
                logger.info(f"Marked {expired_count} jobs as expired")

        except Exception as e:
            logger.error(f"Error expiring old jobs: {e}")

    async def _reset_daily_counters(self):
        """
        Reset daily application counters at midnight.
        """
        logger.info("Resetting daily application counters...")

        try:
            result = await self.users_collection.update_many(
                {"automation_settings.enabled": True},
                {"$set": {"automation_settings.applications_today": 0}}
            )
            logger.info(f"Reset counters for {result.modified_count} users")

        except Exception as e:
            logger.error(f"Error resetting daily counters: {e}")

    async def trigger_auto_apply_now(self, user_id: str) -> int:
        """
        Manually trigger auto-apply for a specific user.

        Args:
            user_id: User's ID

        Returns:
            Number of applications submitted
        """
        logger.info(f"Manually triggering auto-apply for user {user_id}")

        try:
            applications = await self.auto_apply_service.find_and_auto_apply_jobs(user_id)
            logger.info(f"Manually triggered auto-apply submitted {len(applications)} applications")
            return len(applications)

        except Exception as e:
            logger.error(f"Error in manual auto-apply trigger: {e}")
            return 0

    def get_job_status(self) -> dict:
        """
        Get status of all scheduled jobs.

        Returns:
            Dictionary with job statuses
        """
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None
            })

        return {
            "running": self.scheduler.running,
            "jobs": jobs
        }
