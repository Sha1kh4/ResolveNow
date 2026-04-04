from pydantic import BaseModel
from typing import Optional
from app.models.complaint_model import ComplaintPriority


class ComplaintCreate(BaseModel):
    title: str
    description: str
    department_id: str
    priority: Optional[ComplaintPriority] = ComplaintPriority.MEDIUM
