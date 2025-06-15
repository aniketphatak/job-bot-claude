import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Optional, List
import logging
import uuid
from datetime import datetime
import openai
import asyncio

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.chat_sessions_collection = db.ai_chat_sessions
        
        # Default AI provider settings - can be overridden by user preferences
        self.default_provider = "openai"
        self.default_model = "gpt-4o"
        
        # AI API keys will be loaded from environment
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        
    async def get_user_ai_preferences(self, user_id: str) -> Dict:
        """Get user's AI provider preferences"""
        try:
            user_prefs = await self.db.user_ai_preferences.find_one({"user_id": user_id})
            if user_prefs:
                return {
                    "provider": user_prefs.get("provider", self.default_provider),
                    "model": user_prefs.get("model", self.default_model)
                }
            else:
                return {
                    "provider": self.default_provider,
                    "model": self.default_model
                }
        except Exception as e:
            logger.error(f"Error getting user AI preferences: {e}")
            return {
                "provider": self.default_provider,
                "model": self.default_model
            }
    
    async def set_user_ai_preferences(self, user_id: str, provider: str, model: str) -> bool:
        """Set user's AI provider preferences"""
        try:
            await self.db.user_ai_preferences.update_one(
                {"user_id": user_id},
                {"$set": {
                    "provider": provider,
                    "model": model,
                    "updated_at": datetime.utcnow()
                }},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error setting user AI preferences: {e}")
            return False
    
    def _get_api_key(self, provider: str) -> Optional[str]:
        """Get API key for the specified provider"""
        if provider == "openai":
            return self.openai_api_key
        elif provider == "anthropic":
            return self.anthropic_api_key
        else:
            return None
    
    async def _call_openai_api(self, user_id: str, system_message: str, user_prompt: str, model: str = "gpt-4o") -> str:
        """Call OpenAI API directly"""
        session_id = f"{user_id}_{uuid.uuid4()}"
        api_key = self.openai_api_key
        
        if not api_key:
            raise Exception("No OpenAI API key available")
        
        # Store session info in database for tracking
        await self.chat_sessions_collection.insert_one({
            "session_id": session_id,
            "user_id": user_id,
            "provider": "openai",
            "model": model,
            "created_at": datetime.utcnow(),
            "purpose": "job_application"
        })
        
        # Make OpenAI API call
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    async def generate_cover_letter(self, user_id: str, user_profile: Dict, job_details: Dict, 
                                   provider: str = None, model: str = None) -> Dict:
        """Generate a customized cover letter for a job application"""
        try:
            # Get user preferences if not specified
            if not provider or not model:
                prefs = await self.get_user_ai_preferences(user_id)
                provider = provider or prefs["provider"]
                model = model or prefs["model"]
            
            # Create system message for cover letter generation
            system_message = """You are an expert career counselor and professional writer specializing in creating compelling cover letters. 
            Your task is to create personalized, professional cover letters that highlight relevant experience and demonstrate genuine interest in the position.
            
            Guidelines:
            - Keep it concise (300-400 words)
            - Use a professional yet engaging tone
            - Highlight specific achievements and experiences that match the job requirements
            - Show genuine interest in the company and role
            - Include a strong opening and closing
            - Avoid generic phrases and clichés
            - Make it ATS-friendly with relevant keywords from the job description"""
            
            # Prepare the prompt
            user_prompt = f"""
            Please create a professional cover letter based on the following information:
            
            CANDIDATE PROFILE:
            Name: {user_profile.get('personal_info', {}).get('full_name', 'Candidate')}
            
            EXPERIENCE:
            {self._format_experience(user_profile.get('experience', []))}
            
            SKILLS:
            {', '.join(user_profile.get('skills', []))}
            
            EDUCATION:
            {self._format_education(user_profile.get('education', []))}
            
            JOB DETAILS:
            Company: {job_details.get('company', 'Company')}
            Position: {job_details.get('title', 'Position')}
            Location: {job_details.get('location', 'Location')}
            Job Description: {job_details.get('description', 'No description provided')}
            Requirements: {', '.join(job_details.get('requirements', []))}
            
            Please create a compelling cover letter that specifically addresses this role and company, highlighting the most relevant experience and skills.
            """
            
            # Generate cover letter - only support OpenAI for now
            if provider != "openai":
                provider = "openai"
                model = "gpt-4o"
            
            response = await self._call_openai_api(user_id, system_message, user_prompt, model)
            
            # Store the generated content
            cover_letter_record = {
                "user_id": user_id,
                "job_id": job_details.get('id'),
                "company": job_details.get('company'),
                "position": job_details.get('title'),
                "cover_letter": response,
                "provider": provider,
                "model": model,
                "generated_at": datetime.utcnow()
            }
            
            await self.db.generated_cover_letters.insert_one(cover_letter_record)
            
            return {
                "success": True,
                "cover_letter": response,
                "provider": provider,
                "model": model,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating cover letter: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def customize_resume_summary(self, user_id: str, user_profile: Dict, job_details: Dict,
                                     provider: str = None, model: str = None) -> Dict:
        """Generate a customized resume summary/objective for a specific job"""
        try:
            # Get user preferences if not specified
            if not provider or not model:
                prefs = await self.get_user_ai_preferences(user_id)
                provider = provider or prefs["provider"]
                model = model or prefs["model"]
            
            # Create system message for resume customization
            system_message = """You are an expert resume writer and career strategist. 
            Your task is to create compelling, tailored resume summaries that highlight the most relevant qualifications for specific job opportunities.
            
            Guidelines:
            - Keep it concise (2-3 sentences, 50-80 words)
            - Focus on the most relevant experience and achievements
            - Use action words and quantifiable results where possible
            - Include relevant keywords from the job description
            - Make it ATS-friendly
            - Demonstrate clear value proposition"""
            
            # Prepare the prompt
            user_prompt = f"""
            Create a tailored resume summary for the following job application:
            
            CANDIDATE BACKGROUND:
            Current Experience: {self._get_current_role(user_profile.get('experience', []))}
            Key Skills: {', '.join(user_profile.get('skills', [])[:5])}  
            Education: {self._get_highest_education(user_profile.get('education', []))}
            
            TARGET POSITION:
            Company: {job_details.get('company', 'Company')}
            Role: {job_details.get('title', 'Position')}
            Key Requirements: {', '.join(job_details.get('requirements', [])[:3])}
            Job Description Keywords: {self._extract_keywords(job_details.get('description', ''))}
            
            Create a powerful resume summary that positions this candidate as an ideal fit for this specific role.
            Focus on the most relevant qualifications and use keywords from the job posting.
            """
            
            # Generate resume summary - only support OpenAI for now
            if provider != "openai":
                provider = "openai"
                model = "gpt-4o"
            
            response = await self._call_openai_api(user_id, system_message, user_prompt, model)
            
            # Store the generated content
            resume_summary_record = {
                "user_id": user_id,
                "job_id": job_details.get('id'),
                "company": job_details.get('company'),
                "position": job_details.get('title'),
                "resume_summary": response,
                "provider": provider,
                "model": model,
                "generated_at": datetime.utcnow()
            }
            
            await self.db.generated_resume_summaries.insert_one(resume_summary_record)
            
            return {
                "success": True,
                "resume_summary": response,
                "provider": provider,
                "model": model,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating resume summary: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_linkedin_message(self, user_id: str, user_profile: Dict, job_details: Dict,
                                      provider: str = None, model: str = None) -> Dict:
        """Generate a personalized LinkedIn message to the hiring manager"""
        try:
            # Get user preferences if not specified
            if not provider or not model:
                prefs = await self.get_user_ai_preferences(user_id)
                provider = provider or prefs["provider"]
                model = model or prefs["model"]
            
            # Create system message for LinkedIn message
            system_message = """You are an expert at crafting professional LinkedIn messages for job applications.
            Your task is to create personalized, engaging messages that help candidates stand out while maintaining professionalism.
            
            Guidelines:
            - Keep it brief (2-3 sentences, under 100 words)
            - Be personable but professional
            - Mention specific interest in the company/role
            - Highlight one key relevant qualification
            - Include a clear call to action
            - Avoid being overly salesy or desperate"""
            
            # Prepare the prompt
            user_prompt = f"""
            Create a professional LinkedIn connection request message for:
            
            SENDER: {user_profile.get('personal_info', {}).get('full_name', 'Candidate')}
            CURRENT ROLE: {self._get_current_role(user_profile.get('experience', []))}
            
            TARGET:
            Company: {job_details.get('company', 'Company')}
            Position Applied For: {job_details.get('title', 'Position')}
            
            Create a personalized LinkedIn message to send to the hiring manager or recruiter.
            The message should express interest in the role and briefly highlight relevant qualifications.
            """
            
            # Generate LinkedIn message - only support OpenAI for now
            if provider != "openai":
                provider = "openai"
                model = "gpt-4o"
            
            response = await self._call_openai_api(user_id, system_message, user_prompt, model)
            
            # Store the generated content
            linkedin_message_record = {
                "user_id": user_id,
                "job_id": job_details.get('id'),
                "company": job_details.get('company'),
                "position": job_details.get('title'),
                "linkedin_message": response,
                "provider": provider,
                "model": model,
                "generated_at": datetime.utcnow()
            }
            
            await self.db.generated_linkedin_messages.insert_one(linkedin_message_record)
            
            return {
                "success": True,
                "linkedin_message": response,
                "provider": provider,
                "model": model,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating LinkedIn message: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    # Helper methods
    def _format_experience(self, experience: List[Dict]) -> str:
        """Format experience for AI prompt"""
        formatted = []
        for exp in experience[:3]:  # Limit to most recent 3 roles
            formatted.append(f"- {exp.get('title', 'Role')} at {exp.get('company', 'Company')} ({exp.get('start_date', '')} - {exp.get('end_date', '')}): {exp.get('description', '')}")
        return '\n'.join(formatted)
    
    def _format_education(self, education: List[Dict]) -> str:
        """Format education for AI prompt"""
        formatted = []
        for edu in education:
            formatted.append(f"- {edu.get('degree', 'Degree')} from {edu.get('school', 'School')} ({edu.get('graduation_year', '')})")
        return '\n'.join(formatted)
    
    def _get_current_role(self, experience: List[Dict]) -> str:
        """Get current or most recent role"""
        if experience:
            current = experience[0]
            return f"{current.get('title', 'Professional')} at {current.get('company', 'Company')}"
        return "Professional"
    
    def _get_highest_education(self, education: List[Dict]) -> str:
        """Get highest level of education"""
        if education:
            highest = education[0]
            return f"{highest.get('degree', 'Degree')} from {highest.get('school', 'School')}"
        return "Education background"
    
    def _extract_keywords(self, job_description: str) -> str:
        """Extract key terms from job description (simplified)"""
        # This is a simplified keyword extraction
        # In production, you might use more sophisticated NLP
        common_keywords = ['experience', 'management', 'leadership', 'analysis', 'strategy', 'development', 'team', 'product', 'project', 'technical']
        description_lower = job_description.lower()
        found_keywords = [kw for kw in common_keywords if kw in description_lower]
        return ', '.join(found_keywords[:5])
    
    async def get_available_models(self) -> Dict:
        """Get list of available AI models for user selection"""
        return {
            "openai": {
                "models": [
                    "gpt-4o",
                    "gpt-4o-mini", 
                    "gpt-4.1",
                    "gpt-4.1-mini"
                ],
                "recommended": "gpt-4o"
            },
            "anthropic": {
                "models": [
                    "claude-sonnet-4-20250514",
                    "claude-3-5-sonnet-20241022",
                    "claude-3-5-haiku-20241022"
                ],
                "recommended": "claude-sonnet-4-20250514"
            }
        }
    
    async def get_user_generated_content_history(self, user_id: str, limit: int = 10) -> Dict:
        """Get user's AI-generated content history"""
        try:
            # Get recent cover letters
            cover_letters = await self.db.generated_cover_letters.find(
                {"user_id": user_id}
            ).sort("generated_at", -1).limit(limit).to_list(limit)
            
            # Get recent resume summaries
            resume_summaries = await self.db.generated_resume_summaries.find(
                {"user_id": user_id}
            ).sort("generated_at", -1).limit(limit).to_list(limit)
            
            # Get recent LinkedIn messages
            linkedin_messages = await self.db.generated_linkedin_messages.find(
                {"user_id": user_id}
            ).sort("generated_at", -1).limit(limit).to_list(limit)
            
            # Clean up MongoDB ObjectIds
            for collection in [cover_letters, resume_summaries, linkedin_messages]:
                for item in collection:
                    item['_id'] = str(item['_id'])
            
            return {
                "cover_letters": cover_letters,
                "resume_summaries": resume_summaries,
                "linkedin_messages": linkedin_messages
            }
            
        except Exception as e:
            logger.error(f"Error getting user generated content history: {e}")
            return {
                "cover_letters": [],
                "resume_summaries": [],
                "linkedin_messages": []
            }