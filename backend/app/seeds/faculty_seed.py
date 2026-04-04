from datetime import datetime

from app.config.security import hash_password
from app.config.database import get_database
from app.models.user_model import UserRole, UserStatus
from app.models.department_model import DepartmentName


def build_sample_faculty() -> list[dict]:
    current_time = datetime.utcnow()
    return [
        {
            "name": "Dr. Vivek Sharma",
            "email": "vivek.sharma@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
            "department": DepartmentName.BEHAVIOURAL.value,
        },
        {
            "name": "Prof. Anita Desai",
            "email": "anita.desai@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
            "department": DepartmentName.INFRASTRUCTURAL.value,
        },
        {
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh.kumar@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
            "department": DepartmentName.ACADEMIC.value,
        },
        {
            "name": "Prof. Sunita Singh",
            "email": "sunita.singh@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
            "department": DepartmentName.GENERAL.value,
        },
    ]


async def seed_faculty() -> None:
    db = get_database()
    user_collection = db["users"]
    dept_collection = db["departments"]

    # Only seed if no faculty exists
    existing_faculty = await user_collection.count_documents({"role": UserRole.FACULTY.value})
    if existing_faculty > 0:
        return

    sample_faculty = build_sample_faculty()
    
    for faculty_data in sample_faculty:
        dept_name = faculty_data.pop("department")
        existing_user = await user_collection.find_one({"email": faculty_data["email"]})
        
        if not existing_user:
            result = await user_collection.insert_one(faculty_data)
            faculty_id = result.inserted_id
            
            # Link faculty to department
            await dept_collection.update_one(
                {"name": dept_name},
                {"$addToSet": {"faculty_user_ids": faculty_id}}
            )
        else:
            # If user exists, still ensure they're linked to the department
            faculty_id = existing_user["_id"]
            await dept_collection.update_one(
                {"name": dept_name},
                {"$addToSet": {"faculty_user_ids": faculty_id}}
            )


async def insert_missing_sample_faculty() -> dict[str, int]:
    db = get_database()
    user_collection = db["users"]
    dept_collection = db["departments"]
    sample_faculty = build_sample_faculty()

    inserted_count = 0
    skipped_count = 0

    for faculty_data in sample_faculty:
        dept_name = faculty_data.pop("department")
        existing_user = await user_collection.find_one({"email": faculty_data["email"]})
        
        if existing_user:
            faculty_id = existing_user["_id"]
            skipped_count += 1
        else:
            result = await user_collection.insert_one(faculty_data)
            faculty_id = result.inserted_id
            inserted_count += 1
            
        # Ensure faculty is linked to the department
        await dept_collection.update_one(
            {"name": dept_name},
            {"$addToSet": {"faculty_user_ids": faculty_id}}
        )

    return {"inserted": inserted_count, "skipped": skipped_count}
