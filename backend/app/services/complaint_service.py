from datetime import datetime, timedelta
from bson import ObjectId  # ✅ IMPORTANT

from app.repositories.complaint_repository import ComplaintRepository
from app.schemas.complaint_schema import ComplaintCreate
from app.utils.s3_utils import upload_file, generate_filename
from app.models.complaint_model import ComplaintPriority
from app.config.settings import settings


class ComplaintService:

    def __init__(self):
        self.repo = ComplaintRepository()

    async def create_complaint(self, user_id: str, data: ComplaintCreate, file):
        image_url = None

        # 📸 Upload file safely (NO CRASH)
        if file and settings.aws_access_key_id:
            try:
                filename = generate_filename(file.filename)
                image_url = upload_file(file.file, filename)
            except Exception as e:
                print("S3 ERROR:", str(e))
                image_url = None

        # ⏱️ Deadline logic
        deadline = datetime.utcnow() + timedelta(days=4)

        # ✅ FIX: Convert to ObjectId
        complaint_data = {
            "title": data.title,
            "description": data.description,
            "created_by": ObjectId(user_id),                 # ✅ FIX
            "department_id": ObjectId(data.department_id),   # ✅ FIX
            "priority": data.priority or ComplaintPriority.MEDIUM,
            "deadline": deadline,
            "image_url": image_url,
        }

        return await self.repo.create(complaint_data)

    async def get_user_complaints(self, user_id: str):
        return await self.repo.get_by_user(user_id)