from datetime import datetime

from fastapi import HTTPException, status

from app.core.logger import get_logger
from app.models.base_model import ObjectId
from app.models.complaint_model import ComplaintPriority
from app.models.user_model import UserRole, UserStatus
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.department_repository import DepartmentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin_schema import (
    AdminComplaintListItem,
    AdminUserListItem,
    DepartmentDetailItem,
    DepartmentListItem,
    FacultyAssignmentResponse,
    FacultyMemberItem,
    PaginatedAdminComplaintsResponse,
    PaginatedAdminUsersResponse,
)

logger = get_logger("service.admin")


class AdminService:
    def __init__(self) -> None:
        self.user_repository = UserRepository()
        self.department_repository = DepartmentRepository()
        self.complaint_repository = ComplaintRepository()

    @staticmethod
    def _map_user(user: dict) -> AdminUserListItem:
        return AdminUserListItem(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
            user_status=user.get("user_status") or UserStatus.ACTIVE.value,
            created_at=user["created_at"],
        )

    @staticmethod
    def _map_department(department: dict) -> DepartmentListItem:
        return DepartmentListItem(
            id=str(department["_id"]),
            name=department["name"],
            description=department["description"],
            default_priority=department["default_priority"],
            faculty_count=len(department.get("faculty_user_ids", [])),
        )

    @staticmethod
    def _map_faculty_member(user: dict) -> FacultyMemberItem:
        return FacultyMemberItem(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
        )

    @staticmethod
    def _map_complaint(
        complaint: dict,
        *,
        users_by_id: dict[str, dict],
        departments_by_id: dict[str, dict],
    ) -> AdminComplaintListItem:
        created_by = users_by_id.get(str(complaint["created_by"]))
        department = departments_by_id.get(str(complaint["department_id"]))
        return AdminComplaintListItem(
            id=str(complaint["_id"]),
            complaint_id=complaint["complaint_id"],
            title=complaint["title"],
            description=complaint["description"],
            priority=complaint["priority"],
            status=complaint["status"],
            created_at=complaint["created_at"],
            created_by_name=created_by["name"] if created_by else None,
            department_name=department["name"] if department else None,
        )

    async def list_regular_users(self, *, page: int, page_size: int) -> PaginatedAdminUsersResponse:
        logger.debug("Listing pending faculty users: page=%d page_size=%d", page, page_size)
        filters = {
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.PENDING_APPROVAL.value,
        }
        total = await self.user_repository.count_by_filters(filters)
        users = await self.user_repository.list_by_filters(
            filters,
            skip=(page - 1) * page_size,
            limit=page_size,
        )
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        logger.debug("Pending faculty query result: total=%d page=%d", total, page)
        return PaginatedAdminUsersResponse(
            items=[self._map_user(user) for user in users],
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    async def list_departments(self) -> list[DepartmentListItem]:
        logger.debug("Listing all departments")
        departments = await self.department_repository.list_all()
        logger.debug("Departments fetched: count=%d", len(departments))
        return [self._map_department(department) for department in departments]

    async def list_department_details(self) -> list[DepartmentDetailItem]:
        logger.debug("Listing department details with faculty members")
        departments = await self.department_repository.list_all()
        department_details: list[DepartmentDetailItem] = []

        for department in departments:
            faculty_user_ids = department.get("faculty_user_ids", [])
            faculty_users = await self.user_repository.list_by_ids(faculty_user_ids)
            department_details.append(
                DepartmentDetailItem(
                    id=str(department["_id"]),
                    name=department["name"],
                    description=department["description"],
                    default_priority=department["default_priority"],
                    faculty_members=[self._map_faculty_member(user) for user in faculty_users],
                )
            )

        logger.debug("Department details fetched: count=%d", len(department_details))
        return department_details

    async def list_complaints(
        self,
        *,
        page: int,
        page_size: int,
        priority: str | None = None,
        title_query: str | None = None,
    ) -> PaginatedAdminComplaintsResponse:
        logger.debug(
            "Listing complaints: page=%d page_size=%d priority=%s title=%s",
            page,
            page_size,
            priority,
            title_query,
        )
        filters: dict[str, object] = {}

        if priority:
            normalized_priority = priority.upper()
            if normalized_priority not in {item.value for item in ComplaintPriority}:
                logger.warning("Invalid priority filter: priority=%s", priority)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid priority filter.",
                )
            filters["priority"] = normalized_priority

        if title_query:
            filters["title"] = {"$regex": title_query, "$options": "i"}

        total = await self.complaint_repository.count_with_filters(filters)
        complaints = await self.complaint_repository.list_with_filters(
            filters,
            skip=(page - 1) * page_size,
            limit=page_size,
        )

        user_ids = list({complaint["created_by"] for complaint in complaints})
        department_ids = list({complaint["department_id"] for complaint in complaints})
        users = await self.user_repository.list_by_ids(user_ids)
        departments = await self.department_repository.list_by_ids(department_ids)
        users_by_id = {str(user["_id"]): user for user in users}
        departments_by_id = {str(department["_id"]): department for department in departments}
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        logger.debug("Complaint list query result: total=%d page=%d", total, page)
        return PaginatedAdminComplaintsResponse(
            items=[
                self._map_complaint(
                    complaint,
                    users_by_id=users_by_id,
                    departments_by_id=departments_by_id,
                )
                for complaint in complaints
            ],
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    async def assign_faculty_to_department(
        self,
        *,
        user_id: str,
        department_id: str,
    ) -> FacultyAssignmentResponse:
        logger.info("Faculty assignment request: user_id=%s department_id=%s", user_id, department_id)

        if not ObjectId.is_valid(user_id):
            logger.warning("Invalid user_id in assignment: user_id=%s", user_id)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id.")

        if not ObjectId.is_valid(department_id):
            logger.warning("Invalid department_id in assignment: department_id=%s", department_id)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid department id.")

        user = await self.user_repository.find_by_id(user_id)
        if not user:
            logger.warning("Assignment failed – user not found: user_id=%s", user_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        if user.get("role") != UserRole.FACULTY.value:
            logger.warning(
                "Assignment failed – not a faculty user: user_id=%s role=%s",
                user_id,
                user.get("role"),
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only faculty users can be assigned to departments.",
            )

        if user.get("user_status") != UserStatus.PENDING_APPROVAL.value:
            logger.warning(
                "Assignment failed – user not pending approval: user_id=%s status=%s",
                user_id,
                user.get("user_status"),
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only faculty users pending approval can be assigned to departments.",
            )

        department = await self.department_repository.find_by_id(department_id)
        if not department:
            logger.warning("Assignment failed – department not found: department_id=%s", department_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")

        now = datetime.utcnow()
        await self.user_repository.update_user(
            user["_id"],
            {"user_status": UserStatus.ACTIVE.value, "updated_at": now},
        )
        await self.department_repository.remove_faculty_from_all_departments(user["_id"], now)
        await self.department_repository.assign_faculty_to_department(department["_id"], user["_id"], now)

        logger.info(
            "Faculty assigned: user_id=%s email=%s department=%s",
            user_id,
            user.get("email"),
            department.get("name"),
        )

        updated_user = await self.user_repository.find_by_id(user["_id"])
        updated_department = await self.department_repository.find_by_id(department["_id"])
        return FacultyAssignmentResponse(
            message="Faculty approved and department mapping updated successfully.",
            user=self._map_user(updated_user),
            department=self._map_department(updated_department),
        )