from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.services.complaint_service import ComplaintService
from app.schemas.complaint_schema import ComplaintCreate
from app.api.deps import get_current_user

router = APIRouter()
service = ComplaintService()


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

    return await service.create_complaint(user["sub"], data, file)


@router.get("/my")
async def get_my_complaints(user=Depends(get_current_user)):
    return await service.get_user_complaints(user["sub"])
