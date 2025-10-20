"""Resume management service for handling multiple resume versions."""
from typing import List, Optional, Dict, Any
from datetime import datetime
from models.user import Resume
import base64
import os


class ResumeService:
    """Service for managing user resumes."""

    def __init__(self, db):
        self.db = db
        self.users_collection = db["user_profiles"]

    async def upload_resume(
        self,
        user_id: str,
        file_name: str,
        file_content: bytes,
        is_primary: bool = False,
        parsed_data: Optional[Dict[str, Any]] = None
    ) -> Resume:
        """
        Upload a new resume for a user.

        Args:
            user_id: User's ID
            file_name: Name of the resume file
            file_content: Binary content of the resume
            is_primary: Whether this should be the primary resume
            parsed_data: Optional parsed resume data (skills, experience, etc.)

        Returns:
            Created Resume object
        """
        # Convert file content to base64
        content_base64 = base64.b64encode(file_content).decode('utf-8')

        # Create resume object
        resume = Resume(
            file_name=file_name,
            file_size=len(file_content),
            content_base64=content_base64,
            is_primary=is_primary,
            parsed_data=parsed_data
        )

        # Get user profile
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")

        # If setting as primary, unset any existing primary resumes
        if is_primary and "resumes" in user:
            for existing_resume in user["resumes"]:
                existing_resume["is_primary"] = False

        # Add resume to user's resumes list
        resumes = user.get("resumes", [])
        resumes.append(resume.model_dump())

        # Update user profile
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "resumes": resumes,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return resume

    async def get_resumes(self, user_id: str) -> List[Resume]:
        """
        Get all resumes for a user.

        Args:
            user_id: User's ID

        Returns:
            List of Resume objects
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")

        resumes_data = user.get("resumes", [])
        return [Resume(**resume_data) for resume_data in resumes_data]

    async def get_resume(self, user_id: str, resume_id: str) -> Optional[Resume]:
        """
        Get a specific resume by ID.

        Args:
            user_id: User's ID
            resume_id: Resume ID

        Returns:
            Resume object or None if not found
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")

        resumes_data = user.get("resumes", [])
        for resume_data in resumes_data:
            if resume_data.get("id") == resume_id:
                return Resume(**resume_data)

        return None

    async def get_primary_resume(self, user_id: str) -> Optional[Resume]:
        """
        Get the primary resume for a user.

        Args:
            user_id: User's ID

        Returns:
            Primary Resume object or None if no primary resume set
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")

        resumes_data = user.get("resumes", [])
        for resume_data in resumes_data:
            if resume_data.get("is_primary", False):
                return Resume(**resume_data)

        # If no primary resume, return the most recent one
        if resumes_data:
            # Sort by uploaded_at descending
            sorted_resumes = sorted(
                resumes_data,
                key=lambda r: r.get("uploaded_at", datetime.min),
                reverse=True
            )
            return Resume(**sorted_resumes[0])

        return None

    async def set_primary_resume(self, user_id: str, resume_id: str) -> bool:
        """
        Set a resume as the primary resume.

        Args:
            user_id: User's ID
            resume_id: Resume ID to set as primary

        Returns:
            True if successful, False otherwise
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")

        resumes_data = user.get("resumes", [])
        resume_found = False

        # Unset all primary flags and set the specified one
        for resume_data in resumes_data:
            if resume_data.get("id") == resume_id:
                resume_data["is_primary"] = True
                resume_found = True
            else:
                resume_data["is_primary"] = False

        if not resume_found:
            return False

        # Update user profile
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "resumes": resumes_data,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return True

    async def delete_resume(self, user_id: str, resume_id: str) -> bool:
        """
        Delete a resume.

        Args:
            user_id: User's ID
            resume_id: Resume ID to delete

        Returns:
            True if successful, False otherwise
        """
        user = await self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User {user_id} not found")

        resumes_data = user.get("resumes", [])
        original_count = len(resumes_data)

        # Remove the resume
        resumes_data = [r for r in resumes_data if r.get("id") != resume_id]

        if len(resumes_data) == original_count:
            return False  # Resume not found

        # Update user profile
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "resumes": resumes_data,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return True

    async def parse_resume(self, file_content: bytes, file_name: str) -> Dict[str, Any]:
        """
        Parse resume content to extract structured data.

        This is a placeholder for actual resume parsing logic.
        In production, you would use an AI service or specialized library.

        Args:
            file_content: Binary content of the resume
            file_name: Name of the file

        Returns:
            Parsed data dictionary with skills, experience, etc.
        """
        # TODO: Implement actual resume parsing using AI or specialized service
        # For now, return a placeholder
        return {
            "skills": [],
            "experience": [],
            "education": [],
            "certifications": [],
            "summary": "Resume parsing not yet implemented",
            "file_type": os.path.splitext(file_name)[1].lower()
        }
