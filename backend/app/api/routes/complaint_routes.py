from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.repositories.department_repository import DepartmentRepository
from app.services.complaint_service import ComplaintService
from app.schemas.complaint_schema import ComplaintCreate
from app.api.deps import get_current_user

router = APIRouter()
service = ComplaintService()
department_repository = DepartmentRepository()


@router.post("/create")
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    department_id: str = Form(...),
    priority: str = Form("MEDIUM"),
    file: UploadFile = File(None),
    user=Depends(get_current_user)
):
    data = ComplaintCreate(
        title=title,
        description=description,
        department_id=department_id,
        priority=priority
    )

    return await service.create_complaint(str(user["_id"]), data, file)


@router.get("/my")
async def get_my_complaints(user=Depends(get_current_user)):
    return await service.get_user_complaints(str(user["_id"]))


@router.get("/departments")
async def list_departments(_: dict = Depends(get_current_user)):
    departments = await department_repository.list_all()
    return [
        {
            "id": str(department["_id"]),
            "name": department["name"],
            "description": department["description"],
            "default_priority": department.get("default_priority"),
        }
        for department in departments
    ]


@router.get("/{id}")
async def get_complaint_detail(id: str, user=Depends(get_current_user)):
    return await service.get_user_complaint_by_id(str(user["_id"]), id)
