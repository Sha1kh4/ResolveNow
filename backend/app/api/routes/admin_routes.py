from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_admin
from app.schemas.admin_schema import (
    AdminComplaintListItem,
    AdminUserListItem,
    DepartmentDetailItem,
    DepartmentListItem,
    FacultyAssignmentRequest,
    FacultyAssignmentResponse,
    PaginatedAdminComplaintsResponse,
    PaginatedAdminUsersResponse,
)
from app.schemas.auth_schema import AdminCreateRequest, AuthUserResponse
from app.services.admin_service import AdminService
from app.services.auth_service import AuthService


router = APIRouter(prefix="/admins", tags=["Admins"])
auth_service = AuthService()
admin_service = AdminService()


@router.post("", response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    payload: AdminCreateRequest,
    _: dict = Depends(get_current_admin),
) -> AuthUserResponse:
    try:
        return await auth_service.create_admin_by_admin(payload)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while creating the admin account. Please try again.",
        )


@router.get("/users", response_model=PaginatedAdminUsersResponse)
async def list_regular_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=6, ge=1, le=50),
    _: dict = Depends(get_current_admin),
) -> PaginatedAdminUsersResponse:
    try:
        return await admin_service.list_regular_users(page=page, page_size=page_size)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to load users right now. Please try again.",
        )


@router.get("/departments", response_model=list[DepartmentListItem])
async def list_departments(_: dict = Depends(get_current_admin)) -> list[DepartmentListItem]:
    try:
        return await admin_service.list_departments()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to load departments right now. Please try again.",
        )


@router.get("/departments/details", response_model=list[DepartmentDetailItem])
async def list_department_details(_: dict = Depends(get_current_admin)) -> list[DepartmentDetailItem]:
    try:
        return await admin_service.list_department_details()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to load department details right now. Please try again.",
        )


@router.get("/complaints", response_model=PaginatedAdminComplaintsResponse)
async def list_complaints(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=6, ge=1, le=50),
    priority: str | None = Query(default=None),
    title: str | None = Query(default=None),
    _: dict = Depends(get_current_admin),
) -> PaginatedAdminComplaintsResponse:
    try:
        return await admin_service.list_complaints(
            page=page,
            page_size=page_size,
            priority=priority,
            title_query=title,
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to load complaints right now. Please try again.",
        )


@router.post("/faculty-assignments", response_model=FacultyAssignmentResponse)
async def assign_faculty_to_department(
    payload: FacultyAssignmentRequest,
    _: dict = Depends(get_current_admin),
) -> FacultyAssignmentResponse:
    try:
        return await admin_service.assign_faculty_to_department(
            user_id=payload.user_id,
            department_id=payload.department_id,
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to assign faculty right now. Please try again.",
        )
