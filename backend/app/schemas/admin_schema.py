from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.complaint_model import ComplaintPriority, ComplaintStatus
from app.models.department_model import DepartmentName, DepartmentPriority
from app.models.user_model import UserRole


class AdminUserListItem(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime


class PaginatedAdminUsersResponse(BaseModel):
    items: list[AdminUserListItem]
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0)


class DepartmentListItem(BaseModel):
    id: str
    name: DepartmentName
    description: str
    default_priority: DepartmentPriority
    faculty_count: int = Field(default=0)


class FacultyMemberItem(BaseModel):
    id: str
    name: str
    email: EmailStr


class DepartmentDetailItem(BaseModel):
    id: str
    name: DepartmentName
    description: str
    default_priority: DepartmentPriority
    faculty_members: list[FacultyMemberItem] = Field(default_factory=list)


class FacultyAssignmentRequest(BaseModel):
    user_id: str = Field(..., min_length=24, max_length=24)
    department_id: str = Field(..., min_length=24, max_length=24)


class FacultyAssignmentResponse(BaseModel):
    message: str
    user: AdminUserListItem
    department: DepartmentListItem


class AdminComplaintListItem(BaseModel):
    id: str
    complaint_id: str
    title: str
    description: str
    priority: ComplaintPriority
    status: ComplaintStatus
    created_at: datetime
    created_by_name: str | None = None
    department_name: DepartmentName | None = None


class PaginatedAdminComplaintsResponse(BaseModel):
    items: list[AdminComplaintListItem]
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0)
