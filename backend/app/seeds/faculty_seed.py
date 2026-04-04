from datetime import datetime

from app.config.security import hash_password
from app.config.database import get_database
from app.models.user_model import UserRole, UserStatus


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
        },
    ]


async def seed_faculty() -> None:
    db = get_database()
    collection = db["users"]

    # Only seed if no faculty exists
    existing_faculty = await collection.count_documents({"role": UserRole.FACULTY.value})
    if existing_faculty > 0:
        return

    # Check if the exact emails already exist to avoid duplication
    sample_faculty = build_sample_faculty()
    faculty_to_insert = []
    
    for faculty in sample_faculty:
        existing_user = await collection.find_one({"email": faculty["email"]})
        if not existing_user:
            faculty_to_insert.append(faculty)
            
    if faculty_to_insert:
        await collection.insert_many(faculty_to_insert)


async def insert_missing_sample_faculty() -> dict[str, int]:
    db = get_database()
    collection = db["users"]
    sample_faculty = build_sample_faculty()

    inserted_count = 0
    skipped_count = 0

    for faculty in sample_faculty:
        existing_user = await collection.find_one({"email": faculty["email"]})
        if existing_user:
            skipped_count += 1
            continue
        await collection.insert_one(faculty)
        inserted_count += 1

    return {"inserted": inserted_count, "skipped": skipped_count}
