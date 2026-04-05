from datetime import datetime, timedelta
from bson.errors import InvalidId
from fastapi import HTTPException, status
from bson import ObjectId

from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.department_repository import DepartmentRepository
from app.services.assignment_service import AssignmentService
from app.schemas.complaint_schema import ComplaintCreate
from app.utils.s3_utils import upload_file, generate_filename
from app.models.complaint_model import ComplaintPriority
from app.utils.token_utils import generate_complaint_ticket_id
from app.config.settings import settings


class ComplaintService:

    def __init__(self):
        self.repo = ComplaintRepository()
        self.department_repository = DepartmentRepository()
        self.assignment_service = AssignmentService()

    async def create_complaint(self, user_id: str, data: ComplaintCreate, file):
        image_url = None

        # 📸 Upload file safely (NO CRASH)
        if file and settings.aws_access_key_id and settings.aws_secret_access_key:
            try:
                filename = generate_filename(file.filename)
                image_url = upload_file(file.file, filename)
            except Exception as e:
                print("S3 ERROR:", str(e))
                image_url = None

        # ⏱️ Deadline logic
        try:
            created_by = ObjectId(user_id)
            department_id = ObjectId(data.department_id)
        except InvalidId as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid department or user identifier.",
            ) from exc

        # 📂 Validate department
        department = await self.department_repository.find_by_id(department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )

        if not department.get("faculty_user_ids"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No faculty available for the selected department.",
            )

        created_at = datetime.now()
        deadline = created_at + timedelta(days=4)
        print("Deadline:", deadline)
        # 🧾 Prepare complaint data (clean & consistent)
        complaint_data = {
            "complaint_id": generate_complaint_ticket_id(),
            "title": data.title,
            "description": data.description,
            "created_by": created_by,
            "department_id": department_id,
            "priority": data.priority or ComplaintPriority.MEDIUM,
            "deadline": deadline,
            "image_url": image_url,
            "status": "OPEN",
            "created_at": created_at,
            "updated_at": created_at,
        }

        # 💾 Save complaint
        created_complaint = await self.repo.create(complaint_data)

        # 👨‍🏫 Assign complaint
        assignment_result = await self.assignment_service.assign_complaint(created_complaint)

        if assignment_result:
            created_complaint["status"] = assignment_result.get("status", "OPEN")
            created_complaint["assigned_faculty_id"] = assignment_result.get("faculty_id")
            created_complaint["assigned_at"] = assignment_result.get("assigned_at")

        return created_complaint

    async def get_user_complaints(self, user_id: str):
        try:
            user_obj_id = ObjectId(user_id)
        except InvalidId as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user identifier.",
            ) from exc
        print("user_id:", user_obj_id)
        print("userid", user_id)
        return await self.repo.get_by_user(user_obj_id)