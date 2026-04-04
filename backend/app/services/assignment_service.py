from datetime import datetime

from fastapi import HTTPException, status

from app.models.base_model import ObjectId
from app.models.complaint_model import ComplaintStatus
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.department_repository import DepartmentRepository
from app.repositories.facultyAssignmentRepository import FacultyAssignmentRepository
from app.utils.round_robin import get_next_faculty_id


class AssignmentService:
    def __init__(self) -> None:
        self.department_repository = DepartmentRepository()
        self.faculty_assignment_repository = FacultyAssignmentRepository()
        self.complaint_repository = ComplaintRepository()

    async def assign_complaint(self, complaint: dict) -> dict:
        department = await self.department_repository.find_by_id(complaint["department_id"])
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found for complaint assignment.",
            )

        faculty_user_ids = department.get("faculty_user_ids", [])
        if not faculty_user_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No faculty available for the selected department.",
            )

        latest_assignment = await self.faculty_assignment_repository.get_latest_by_department(
            complaint["department_id"]
        )
        last_assigned_faculty_id = (
            latest_assignment.get("faculty_id") if latest_assignment else None
        )
        next_faculty_id = get_next_faculty_id(faculty_user_ids, last_assigned_faculty_id)
        assigned_at = datetime.utcnow()
        complaint_object_id = (
            ObjectId(complaint["_id"])
            if isinstance(complaint["_id"], str) and ObjectId.is_valid(complaint["_id"])
            else complaint["_id"]
        )
        department_object_id = (
            ObjectId(complaint["department_id"])
            if isinstance(complaint["department_id"], str)
            and ObjectId.is_valid(complaint["department_id"])
            else complaint["department_id"]
        )

        assignment_record = {
            "complaint_id": complaint_object_id,
            "faculty_id": next_faculty_id,
            "department_id": department_object_id,
            "assigned_at": assigned_at,
            "assigned_by": None,
            "created_at": assigned_at,
            "updated_at": assigned_at,
        }
        await self.faculty_assignment_repository.create(assignment_record)
        await self.complaint_repository.update_assignment_status(
            complaint["_id"],
            status=ComplaintStatus.ASSIGNED.value,
            updated_at=assigned_at,
        )

        return {
            "faculty_id": str(next_faculty_id),
            "assigned_at": assigned_at,
            "status": ComplaintStatus.ASSIGNED.value,
        }
