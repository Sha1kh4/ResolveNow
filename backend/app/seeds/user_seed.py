from datetime import datetime

from app.config.security import hash_password
from app.config.database import get_database
from app.models.user_model import UserRole, UserStatus


def build_sample_users() -> list[dict]:
    current_time = datetime.utcnow()
    return [
        {
            "name": "Aarav Sharma",
            "email": "aarav.sharma@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
        },
        {
            "name": "Priya Verma",
            "email": "priya.verma@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
        },
        {
            "name": "Rohan Mehta",
            "email": "rohan.mehta@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
        },
        {
            "name": "Sneha Patel",
            "email": "sneha.patel@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
        },
        {
            "name": "Kunal Desai",
            "email": "kunal.desai@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
        },
        {
            "name": "Neha Gupta",
            "email": "neha.gupta@example.com",
            "password_hash": hash_password("Password123"),
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.ACTIVE.value,
            "is_email_verified": True,
            "is_active": True,
            "email_verification": None,
            "refresh_tokens": [],
            "created_at": current_time,
            "updated_at": current_time,
        },
    ]


async def seed_users() -> None:
    db = get_database()
    collection = db["users"]

    existing_users = await collection.count_documents({})
    if existing_users > 0:
        return

    await collection.insert_many(build_sample_users())


async def insert_missing_sample_users() -> dict[str, int]:
    db = get_database()
    collection = db["users"]
    sample_users = build_sample_users()

    inserted_count = 0
    skipped_count = 0

    for user in sample_users:
        existing_user = await collection.find_one({"email": user["email"]})
        if existing_user:
            skipped_count += 1
            continue
        await collection.insert_one(user)
        inserted_count += 1

    return {"inserted": inserted_count, "skipped": skipped_count}
