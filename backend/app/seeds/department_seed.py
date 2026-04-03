from datetime import datetime

from app.config.database import get_database
from app.models.department_model import Department, DepartmentName, DepartmentPriority


async def seed_departments() -> None:
    db = get_database()
    collection = db["departments"]

    existing_departments = await collection.count_documents({})
    if existing_departments > 0:
        return

    current_time = datetime.utcnow()
    departments = [
        Department(
            name=DepartmentName.BEHAVIOURAL,
            description="Handles behavioural and disciplinary complaints",
            default_priority=DepartmentPriority.MEDIUM,
            faculty_user_ids=[],
            created_at=current_time,
            updated_at=current_time,
        ),
        Department(
            name=DepartmentName.INFRASTRUCTURAL,
            description="Handles infrastructure related issues",
            default_priority=DepartmentPriority.MEDIUM,
            faculty_user_ids=[],
            created_at=current_time,
            updated_at=current_time,
        ),
        Department(
            name=DepartmentName.ACADEMIC,
            description="Handles academic related complaints",
            default_priority=DepartmentPriority.LOW,
            faculty_user_ids=[],
            created_at=current_time,
            updated_at=current_time,
        ),
        Department(
            name=DepartmentName.GENERAL,
            description="Handles general complaints",
            default_priority=DepartmentPriority.LOW,
            faculty_user_ids=[],
            created_at=current_time,
            updated_at=current_time,
        ),
    ]

    await collection.insert_many(
        [department.model_dump(exclude={"id"}) for department in departments]
    )
