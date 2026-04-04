import unittest
from datetime import datetime, timedelta
from unittest.mock import patch

from fastapi import HTTPException

from app.services.auth_service import AuthService
from app.models.user_model import UserRole, UserStatus
from app.schemas.auth_schema import UserLoginRequest, UserRegisterRequest


class FakeUserRepository:
    def __init__(self) -> None:
        self.users_by_email = {}
        self.users_by_id = {}
        self.users_by_token_hash = {}
        self.created_user = None
        self.updated_payloads = []

    async def find_by_email(self, email):
        return self.users_by_email.get(email)

    async def create_user(self, user_document):
        created_user = {"_id": "507f1f77bcf86cd799439011", **user_document}
        self.created_user = created_user
        self.users_by_email[created_user["email"]] = created_user
        self.users_by_id[created_user["_id"]] = created_user
        token_hash = created_user.get("email_verification", {}).get("token_hash")
        if token_hash:
            self.users_by_token_hash[token_hash] = created_user
        return created_user

    async def find_by_verification_token_hash(self, token_hash):
        return self.users_by_token_hash.get(token_hash)

    async def update_user(self, user_id, update_data):
        self.updated_payloads.append((user_id, update_data))
        user = self.users_by_id[user_id]
        for key, value in update_data.items():
            if "." in key:
                root_key, nested_key = key.split(".", 1)
                user.setdefault(root_key, {})[nested_key] = value
            else:
                user[key] = value

    async def clear_expired_refresh_tokens(self, user_id, now):
        return None

    async def append_refresh_token(self, user_id, refresh_token_data):
        return None

    async def mark_refresh_token_used(self, user_id, token_hash, last_used_at):
        return None

    async def revoke_refresh_token(self, user_id, token_hash, revoked_at):
        return None

    async def find_by_id(self, user_id):
        return self.users_by_id.get(user_id)


class AuthServiceTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.service = AuthService()
        self.repository = FakeUserRepository()
        self.service.user_repository = self.repository

    @patch("app.services.auth_service.send_verification_email", return_value=True)
    async def test_student_registration_starts_pending_email_verification(self, _send_email):
        response = await self.service.register_user(
            UserRegisterRequest(
                name="Student One",
                email="student@example.com",
                password="Password123",
                role=UserRole.STUDENT,
            )
        )

        self.assertEqual(response.user.role, UserRole.STUDENT)
        self.assertEqual(response.user.user_status, UserStatus.PENDING_EMAIL_VERIFICATION)
        self.assertEqual(
            self.repository.created_user["user_status"],
            UserStatus.PENDING_EMAIL_VERIFICATION.value,
        )

    async def test_student_email_verification_activates_account(self):
        user = {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Student One",
            "email": "student@example.com",
            "password_hash": "hashed",
            "role": UserRole.STUDENT.value,
            "user_status": UserStatus.PENDING_EMAIL_VERIFICATION.value,
            "is_email_verified": False,
            "is_active": True,
            "email_verification": {
                "token_hash": "student-token-hash",
                "expires_at": datetime.utcnow() + timedelta(hours=1),
                "sent_at": datetime.utcnow(),
                "verified_at": None,
            },
            "refresh_tokens": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        self.repository.users_by_token_hash["student-token-hash"] = user
        self.repository.users_by_id[user["_id"]] = user

        with patch(
            "app.services.auth_service.hash_email_verification_token",
            return_value="student-token-hash",
        ):
            response = await self.service.verify_email("plain-token")

        self.assertIn("student account is now active", response.message.lower())
        self.assertEqual(user["user_status"], UserStatus.ACTIVE.value)
        self.assertTrue(user["is_email_verified"])

    async def test_faculty_email_verification_leaves_account_pending_approval(self):
        user = {
            "_id": "507f1f77bcf86cd799439013",
            "name": "Faculty One",
            "email": "faculty@example.com",
            "password_hash": "hashed",
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.PENDING_EMAIL_VERIFICATION.value,
            "is_email_verified": False,
            "is_active": True,
            "email_verification": {
                "token_hash": "faculty-token-hash",
                "expires_at": datetime.utcnow() + timedelta(hours=1),
                "sent_at": datetime.utcnow(),
                "verified_at": None,
            },
            "refresh_tokens": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        self.repository.users_by_token_hash["faculty-token-hash"] = user
        self.repository.users_by_id[user["_id"]] = user

        with patch(
            "app.services.auth_service.hash_email_verification_token",
            return_value="faculty-token-hash",
        ):
            response = await self.service.verify_email("plain-token")

        self.assertIn("pending admin approval", response.message.lower())
        self.assertEqual(user["user_status"], UserStatus.PENDING_APPROVAL.value)
        self.assertTrue(user["is_email_verified"])

    async def test_login_blocks_faculty_pending_approval(self):
        pending_faculty = {
            "_id": "507f1f77bcf86cd799439014",
            "name": "Faculty One",
            "email": "faculty@example.com",
            "password_hash": "stored-hash",
            "role": UserRole.FACULTY.value,
            "user_status": UserStatus.PENDING_APPROVAL.value,
            "is_email_verified": True,
            "is_active": True,
            "refresh_tokens": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        self.repository.users_by_email[pending_faculty["email"]] = pending_faculty

        with patch("app.services.auth_service.verify_password", return_value=True):
            with self.assertRaises(HTTPException) as context:
                await self.service.login_user(
                    UserLoginRequest(email="faculty@example.com", password="Password123")
                )

        self.assertEqual(context.exception.status_code, 403)
        self.assertIn("pending admin approval", context.exception.detail.lower())
