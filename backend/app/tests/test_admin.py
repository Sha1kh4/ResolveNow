import unittest
from datetime import datetime

from app.services.admin_service import AdminService
from app.models.user_model import UserRole, UserStatus


class FakeAdminUserRepository:
    def __init__(self):
        self.users = {}
        self.updated_payloads = []

    async def count_by_filters(self, filters):
        return len(
            [
                user
                for user in self.users.values()
                if user["role"] == filters["role"]
                and user.get("user_status") == filters["user_status"]
            ]
        )

    async def list_by_filters(self, filters, skip=0, limit=None):
        users = [
            user
            for user in self.users.values()
            if user["role"] == filters["role"]
            and user.get("user_status") == filters["user_status"]
        ]
        users.sort(key=lambda item: item["created_at"], reverse=True)
        sliced = users[skip:]
        if limit is not None:
            sliced = sliced[:limit]
        return sliced

    async def find_by_id(self, user_id):
        return self.users.get(user_id)

    async def update_user(self, user_id, update_data):
        self.updated_payloads.append((user_id, update_data))
        self.users[user_id].update(update_data)

    async def list_by_ids(self, user_ids):
        return [self.users[user_id] for user_id in user_ids if user_id in self.users]


class FakeDepartmentRepository:
    def __init__(self):
        self.departments = {}

    async def list_all(self):
        return list(self.departments.values())

    async def find_by_id(self, department_id):
        return self.departments.get(department_id)

    async def list_by_ids(self, department_ids):
        return [
            self.departments[department_id]
            for department_id in department_ids
            if department_id in self.departments
        ]

    async def remove_faculty_from_all_departments(self, user_id, updated_at):
        for department in self.departments.values():
            existing_ids = department.get("faculty_user_ids", [])
            department["faculty_user_ids"] = [item for item in existing_ids if item != user_id]
            department["updated_at"] = updated_at

    async def assign_faculty_to_department(self, department_id, user_id, updated_at):
        department = self.departments[department_id]
        department.setdefault("faculty_user_ids", [])
        if user_id not in department["faculty_user_ids"]:
            department["faculty_user_ids"].append(user_id)
        department["updated_at"] = updated_at


class FakeComplaintRepository:
    async def count_with_filters(self, filters):
        return 0

    async def list_with_filters(self, filters, skip=0, limit=None):
        return []


class AdminServiceTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.service = AdminService()
        self.user_repository = FakeAdminUserRepository()
        self.department_repository = FakeDepartmentRepository()
        self.service.user_repository = self.user_repository
        self.service.department_repository = self.department_repository
        self.service.complaint_repository = FakeComplaintRepository()

        now = datetime.utcnow()
        self.user_repository.users = {
            "507f1f77bcf86cd799439021": {
                "_id": "507f1f77bcf86cd799439021",
                "name": "Pending Faculty",
                "email": "pending.faculty@example.com",
                "role": UserRole.FACULTY.value,
                "user_status": UserStatus.PENDING_APPROVAL.value,
                "created_at": now,
                "updated_at": now,
            },
            "507f1f77bcf86cd799439022": {
                "_id": "507f1f77bcf86cd799439022",
                "name": "Active Faculty",
                "email": "active.faculty@example.com",
                "role": UserRole.FACULTY.value,
                "user_status": UserStatus.ACTIVE.value,
                "created_at": now,
                "updated_at": now,
            },
            "507f1f77bcf86cd799439023": {
                "_id": "507f1f77bcf86cd799439023",
                "name": "Student One",
                "email": "student.one@example.com",
                "role": UserRole.STUDENT.value,
                "user_status": UserStatus.ACTIVE.value,
                "created_at": now,
                "updated_at": now,
            },
        }
        self.department_repository.departments = {
            "507f1f77bcf86cd799439031": {
                "_id": "507f1f77bcf86cd799439031",
                "name": "ACADEMIC",
                "description": "Academic issues",
                "default_priority": "LOW",
                "faculty_user_ids": [],
                "created_at": now,
                "updated_at": now,
            }
        }

    async def test_list_regular_users_returns_only_pending_faculty(self):
        response = await self.service.list_regular_users(page=1, page_size=10)

        self.assertEqual(response.total, 1)
        self.assertEqual(len(response.items), 1)
        self.assertEqual(response.items[0].role, UserRole.FACULTY)
        self.assertEqual(response.items[0].user_status, UserStatus.PENDING_APPROVAL)

    async def test_assign_faculty_to_department_activates_pending_faculty(self):
        response = await self.service.assign_faculty_to_department(
            user_id="507f1f77bcf86cd799439021",
            department_id="507f1f77bcf86cd799439031",
        )

        self.assertEqual(response.user.role, UserRole.FACULTY)
        self.assertEqual(response.user.user_status, UserStatus.ACTIVE)
        self.assertEqual(
            self.user_repository.users["507f1f77bcf86cd799439021"]["user_status"],
            UserStatus.ACTIVE.value,
        )
        self.assertIn(
            "507f1f77bcf86cd799439021",
            self.department_repository.departments["507f1f77bcf86cd799439031"][
                "faculty_user_ids"
            ],
        )
