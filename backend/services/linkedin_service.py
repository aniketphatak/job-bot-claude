import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

class LinkedInService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        self.redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI', 'http://localhost:8001/api/linkedin/callback')
        self.base_url = "https://api.linkedin.com/v2"
        
        # Rate limiting
        self.api_calls_today = 0
        self.last_reset = datetime.utcnow().date()
        self.daily_limit = 100  # LinkedIn's typical daily limit for job searches
        
    async def get_user_access_token(self, user_id: str) -> Optional[str]:
        """Get stored access token for user"""
        try:
            user_token = await self.db.linkedin_tokens.find_one({"user_id": user_id})
            if user_token and user_token.get('expires_at', datetime.utcnow()) > datetime.utcnow():
                return user_token['access_token']
            return None
        except Exception as e:
            logger.error(f"Error getting user access token: {e}")
            return None
    
    async def store_user_access_token(self, user_id: str, access_token: str, expires_in: int) -> bool:
        """Store access token for user"""
        try:
            expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            await self.db.linkedin_tokens.update_one(
                {"user_id": user_id},
                {"$set": {
                    "access_token": access_token,
                    "expires_at": expires_at,
                    "updated_at": datetime.utcnow()
                }},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error storing user access token: {e}")
            return False
    
    def get_auth_url(self, state: str = None) -> str:
        """Generate LinkedIn OAuth authorization URL"""
        scope = "r_liteprofile,r_emailaddress"  # Basic permissions
        auth_url = (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={scope}"
        )
        if state:
            auth_url += f"&state={state}"
        return auth_url
    
    async def exchange_code_for_token(self, code: str) -> Dict:
        """Exchange authorization code for access token"""
        try:
            token_url = "https://www.linkedin.com/oauth/v2/accessToken"
            data = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri,
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
            
            response = requests.post(token_url, data=data)
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Token exchange failed: {response.text}")
                
        except Exception as e:
            logger.error(f"Error exchanging code for token: {e}")
            raise
    
    def _check_rate_limit(self) -> bool:
        """Check if we're within rate limits"""
        today = datetime.utcnow().date()
        
        # Reset counter if new day
        if today > self.last_reset:
            self.api_calls_today = 0
            self.last_reset = today
        
        return self.api_calls_today < self.daily_limit
    
    def _record_api_call(self):
        """Record an API call for rate limiting"""
        self.api_calls_today += 1
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user's LinkedIn profile"""
        try:
            if not self._check_rate_limit():
                logger.warning("LinkedIn API rate limit reached")
                return None
            
            access_token = await self.get_user_access_token(user_id)
            if not access_token:
                logger.warning(f"No access token for user {user_id}")
                return None
            
            headers = {'Authorization': f'Bearer {access_token}'}
            url = f"{self.base_url}/people/~"
            
            response = requests.get(url, headers=headers)
            self._record_api_call()
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get user profile: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return None
    
    async def search_jobs_basic(self, user_id: str, keywords: str, location: str = "") -> List[Dict]:
        """
        Basic job search using LinkedIn API
        Note: LinkedIn's official API has very limited job search capabilities
        This is a simplified implementation that may require special API access
        """
        try:
            if not self._check_rate_limit():
                logger.warning("LinkedIn API rate limit reached")
                return []
            
            access_token = await self.get_user_access_token(user_id)
            if not access_token:
                logger.warning(f"No access token for user {user_id}")
                return []
            
            headers = {'Authorization': f'Bearer {access_token}'}
            
            # Note: This endpoint may not be available for most applications
            # LinkedIn restricts job search API access to select partners
            url = f"{self.base_url}/jobSearch"
            params = {
                'keywords': keywords,
                'location': location,
                'count': 25
            }
            
            response = requests.get(url, headers=headers, params=params)
            self._record_api_call()
            
            if response.status_code == 200:
                data = response.json()
                jobs = []
                
                for job_element in data.get('elements', []):
                    job = {
                        'id': job_element.get('id'),
                        'title': job_element.get('title'),
                        'company': job_element.get('companyName'),
                        'location': job_element.get('location'),
                        'description': job_element.get('description'),
                        'url': f"https://www.linkedin.com/jobs/view/{job_element.get('id')}",
                        'posted_at': job_element.get('listedAt'),
                        'source': 'linkedin_api',
                        'discovered_at': datetime.utcnow()
                    }
                    jobs.append(job)
                
                return jobs
            else:
                logger.error(f"Job search failed: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching jobs: {e}")
            return []
    
    async def get_job_details(self, user_id: str, job_id: str) -> Optional[Dict]:
        """Get detailed information about a specific job"""
        try:
            if not self._check_rate_limit():
                logger.warning("LinkedIn API rate limit reached")
                return None
            
            access_token = await self.get_user_access_token(user_id)
            if not access_token:
                return None
            
            headers = {'Authorization': f'Bearer {access_token}'}
            url = f"{self.base_url}/jobs/{job_id}"
            
            response = requests.get(url, headers=headers)
            self._record_api_call()
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get job details: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting job details: {e}")
            return None
    
    async def submit_job_application(self, user_id: str, job_id: str, cover_letter: str = "") -> bool:
        """
        Submit job application via LinkedIn API
        Note: This requires special API access and may not be available for most applications
        """
        try:
            if not self._check_rate_limit():
                logger.warning("LinkedIn API rate limit reached")
                return False
            
            access_token = await self.get_user_access_token(user_id)
            if not access_token:
                return False
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Note: This endpoint may require special permissions
            url = f"{self.base_url}/jobApplications"
            data = {
                'job': job_id,
                'coverLetter': cover_letter
            }
            
            response = requests.post(url, json=data, headers=headers)
            self._record_api_call()
            
            if response.status_code == 201:
                logger.info(f"Successfully applied to job {job_id}")
                return True
            else:
                logger.error(f"Failed to submit application: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error submitting job application: {e}")
            return False
    
    async def get_rate_limit_status(self) -> Dict:
        """Get current rate limit status"""
        today = datetime.utcnow().date()
        
        # Reset counter if new day
        if today > self.last_reset:
            self.api_calls_today = 0
            self.last_reset = today
        
        return {
            "calls_made_today": self.api_calls_today,
            "daily_limit": self.daily_limit,
            "calls_remaining": max(0, self.daily_limit - self.api_calls_today),
            "resets_at": "00:00 UTC"
        }
    
    async def create_mock_jobs_for_demo(self, campaign_id: str, keywords: List[str]) -> List[Dict]:
        """
        Create mock job listings for demo purposes when API is not available
        This simulates what would come from LinkedIn API
        """
        companies = [
            "Meta", "Google", "Apple", "Microsoft", "Amazon", "Netflix", "Uber", "Airbnb",
            "Stripe", "Square", "Coinbase", "Robinhood", "Spotify", "Slack", "Zoom", "Figma"
        ]
        
        locations = [
            "San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", 
            "Remote", "Los Angeles, CA", "Boston, MA", "Chicago, IL"
        ]
        
        job_templates = [
            {
                "title_template": "Senior {keyword}",
                "description_template": "We are looking for an experienced {keyword} to join our team. You will be responsible for leading strategic initiatives and driving growth.",
                "requirements": ["5+ years experience", "Leadership skills", "Strategic thinking"]
            },
            {
                "title_template": "{keyword} Manager",
                "description_template": "Join our dynamic team as a {keyword} Manager. Lead cross-functional teams and deliver innovative solutions.",
                "requirements": ["3+ years experience", "Team leadership", "Project management"]
            },
            {
                "title_template": "Head of {keyword}",
                "description_template": "We're seeking a Head of {keyword} to scale our organization and drive strategic initiatives.",
                "requirements": ["8+ years experience", "Executive leadership", "Vision and strategy"]
            }
        ]
        
        mock_jobs = []
        for i in range(6):  # Generate 6 mock jobs
            template = job_templates[i % len(job_templates)]
            keyword = keywords[i % len(keywords)] if keywords else "Product"
            company = companies[i % len(companies)]
            location = locations[i % len(locations)]
            
            # Vary posting times to simulate real job flow
            posted_minutes_ago = (i * 30) + (i * 15)  # Stagger posting times
            posted_at = datetime.utcnow() - timedelta(minutes=posted_minutes_ago)
            
            job = {
                'id': f'mock_job_{i+1}',
                'campaign_id': campaign_id,
                'title': template['title_template'].format(keyword=keyword.title()),
                'company': company,
                'location': location,
                'salary': f"${120 + (i * 20)}k - ${150 + (i * 25)}k",
                'description': template['description_template'].format(keyword=keyword),
                'requirements': template['requirements'],
                'url': f"https://linkedin.com/jobs/view/mock_{i+1}",
                'posted_at': posted_at,
                'application_deadline': posted_at + timedelta(hours=3),
                'source': 'mock_demo',
                'discovered_at': datetime.utcnow(),
                'match_score': 75 + (i * 3),  # Vary match scores
                'urgency': 'high' if i < 2 else 'medium' if i < 4 else 'low'
            }
            mock_jobs.append(job)
        
        return mock_jobs
    
    async def simulate_application_process(self, user_id: str, job_id: str) -> Dict:
        """
        Simulate the application process for demo purposes
        Returns a realistic simulation of what would happen in real application
        """
        # Simulate processing time
        await self._simulate_delay(2, 5)
        
        # Simulate success/failure based on job characteristics
        import random
        success_rate = 0.85  # 85% success rate for demo
        
        if random.random() < success_rate:
            return {
                'success': True,
                'message': 'Application submitted successfully',
                'submitted_at': datetime.utcnow().isoformat(),
                'confirmation_id': f'APP_{random.randint(100000, 999999)}',
                'estimated_response_time': '3-7 business days'
            }
        else:
            return {
                'success': False,
                'message': 'Application submission failed - please try again',
                'error': 'Network timeout or server error'
            }
    
    async def _simulate_delay(self, min_seconds: int, max_seconds: int):
        """Simulate realistic processing delay"""
        import random
        import asyncio
        delay = random.uniform(min_seconds, max_seconds)
        await asyncio.sleep(delay)