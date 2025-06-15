import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorDatabase
from models.analytics import UserAnalytics, CampaignAnalytics, DailyStats
from services.application_service import ApplicationService
from services.campaign_service import CampaignService
from typing import List, Dict, Any
from datetime import datetime, timedelta, date
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.application_service = ApplicationService(db)
        self.campaign_service = CampaignService(db)

    async def get_user_analytics(self, user_id: str) -> UserAnalytics:
        """Get comprehensive analytics for a user"""
        try:
            # Get all applications for the user
            applications = await self.application_service.get_applications_by_user(user_id)
            
            # Calculate basic stats
            total_applications = len(applications)
            total_responses = len([app for app in applications if app.response])
            total_interviews = len([app for app in applications if app.status == "interview_scheduled"])
            
            # Calculate rates
            overall_response_rate = (total_responses / total_applications * 100) if total_applications > 0 else 0
            overall_interview_rate = (total_interviews / total_applications * 100) if total_applications > 0 else 0
            
            # Calculate average response time
            avg_response_time = await self._calculate_avg_response_time(applications)
            
            # Get applications by day
            applications_by_day = await self._get_applications_by_day(applications)
            
            # Get top performing keywords
            top_keywords = await self._get_top_performing_keywords(user_id)
            
            # Get campaign analytics
            campaign_analytics = await self._get_campaign_analytics(user_id)
            
            return UserAnalytics(
                user_id=user_id,
                total_applications=total_applications,
                total_responses=total_responses,
                total_interviews=total_interviews,
                overall_response_rate=overall_response_rate,
                overall_interview_rate=overall_interview_rate,
                avg_response_time=avg_response_time,
                applications_by_day=applications_by_day,
                top_performing_keywords=top_keywords,
                campaign_analytics=campaign_analytics
            )
        except Exception as e:
            logger.error(f"Error getting user analytics for {user_id}: {e}")
            raise

    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for a user"""
        try:
            analytics = await self.get_user_analytics(user_id)
            
            # Calculate week-over-week changes
            last_week_apps = await self._get_applications_last_week(user_id)
            week_change = len(last_week_apps) - (analytics.total_applications - len(last_week_apps))
            week_change_percent = (week_change / len(last_week_apps) * 100) if len(last_week_apps) > 0 else 0
            
            return {
                "total_applications": analytics.total_applications,
                "response_rate": round(analytics.overall_response_rate, 1),
                "interview_rate": round(analytics.overall_interview_rate, 1),
                "avg_response_time": round(analytics.avg_response_time, 1),
                "week_change_percent": round(week_change_percent, 1),
                "applications_by_day": analytics.applications_by_day[-7:],  # Last 7 days
                "top_performing_keywords": analytics.top_performing_keywords[:5]
            }
        except Exception as e:
            logger.error(f"Error getting dashboard stats for {user_id}: {e}")
            raise

    async def _calculate_avg_response_time(self, applications: List) -> float:
        """Calculate average response time in days"""
        try:
            response_times = []
            for app in applications:
                if app.response and app.response.received_at:
                    time_diff = app.response.received_at - app.submitted_at
                    response_times.append(time_diff.total_seconds() / 86400)  # Convert to days
            
            return sum(response_times) / len(response_times) if response_times else 0
        except Exception as e:
            logger.error(f"Error calculating average response time: {e}")
            return 0

    async def _get_applications_by_day(self, applications: List) -> List[Dict[str, Any]]:
        """Get applications grouped by day"""
        try:
            # Group applications by date
            apps_by_date = {}
            for app in applications:
                app_date = app.submitted_at.date()
                apps_by_date[app_date] = apps_by_date.get(app_date, 0) + 1
            
            # Convert to list format for the last 30 days
            result = []
            for i in range(30):
                target_date = (datetime.utcnow() - timedelta(days=i)).date()
                result.append({
                    "date": target_date.strftime("%Y-%m-%d"),
                    "count": apps_by_date.get(target_date, 0)
                })
            
            return list(reversed(result))
        except Exception as e:
            logger.error(f"Error getting applications by day: {e}")
            return []

    async def _get_top_performing_keywords(self, user_id: str) -> List[str]:
        """Get top performing keywords based on response rates"""
        try:
            # This is a simplified version - in production, you'd analyze job descriptions
            # and correlate with response rates
            campaigns = await self.campaign_service.get_campaigns_by_user(user_id)
            
            keyword_performance = {}
            for campaign in campaigns:
                response_rate = (campaign.responses / campaign.applications_submitted) if campaign.applications_submitted > 0 else 0
                for keyword in campaign.keywords:
                    if keyword not in keyword_performance:
                        keyword_performance[keyword] = []
                    keyword_performance[keyword].append(response_rate)
            
            # Calculate average response rate per keyword
            keyword_avg = {}
            for keyword, rates in keyword_performance.items():
                keyword_avg[keyword] = sum(rates) / len(rates)
            
            # Sort by performance
            top_keywords = sorted(keyword_avg.items(), key=lambda x: x[1], reverse=True)
            return [keyword for keyword, _ in top_keywords[:10]]
        except Exception as e:
            logger.error(f"Error getting top performing keywords: {e}")
            return []

    async def _get_campaign_analytics(self, user_id: str) -> List[CampaignAnalytics]:
        """Get analytics for all user campaigns"""
        try:
            campaigns = await self.campaign_service.get_campaigns_by_user(user_id)
            campaign_analytics = []
            
            for campaign in campaigns:
                # Calculate rates
                response_rate = (campaign.responses / campaign.applications_submitted * 100) if campaign.applications_submitted > 0 else 0
                interview_rate = (campaign.interviews / campaign.applications_submitted * 100) if campaign.applications_submitted > 0 else 0
                
                # Get applications for this campaign to calculate response time
                campaign_apps = await self.application_service.get_applications_by_campaign(campaign.id)
                avg_response_time = await self._calculate_avg_response_time(campaign_apps)
                
                # Get daily stats (simplified)
                daily_stats = await self._get_campaign_daily_stats(campaign.id)
                
                campaign_analytics.append(CampaignAnalytics(
                    campaign_id=campaign.id,
                    campaign_name=campaign.name,
                    applications_submitted=campaign.applications_submitted,
                    response_rate=response_rate,
                    interview_rate=interview_rate,
                    avg_response_time=avg_response_time,
                    top_performing_keywords=campaign.keywords[:5],  # Top 5 keywords
                    daily_stats=daily_stats
                ))
            
            return campaign_analytics
        except Exception as e:
            logger.error(f"Error getting campaign analytics: {e}")
            return []

    async def _get_campaign_daily_stats(self, campaign_id: str) -> List[DailyStats]:
        """Get daily stats for a campaign"""
        try:
            # This is simplified - in production you'd query actual daily data
            stats = []
            for i in range(7):  # Last 7 days
                target_date = (datetime.utcnow() - timedelta(days=i)).date()
                stats.append(DailyStats(
                    date=target_date,
                    applications_submitted=0,  # Would be calculated from actual data
                    responses_received=0,
                    interviews_scheduled=0
                ))
            return list(reversed(stats))
        except Exception as e:
            logger.error(f"Error getting campaign daily stats: {e}")
            return []

    async def _get_applications_last_week(self, user_id: str) -> List:
        """Get applications from last week"""
        try:
            week_ago = datetime.utcnow() - timedelta(days=7)
            applications = await self.application_service.get_applications_by_user(user_id)
            return [app for app in applications if app.submitted_at >= week_ago]
        except Exception as e:
            logger.error(f"Error getting last week applications: {e}")
            return []