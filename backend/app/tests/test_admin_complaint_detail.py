import unittest
from datetime import datetime, timezone
from app.services.admin_service import AdminService
from app.models.base_model import ObjectId


class FakeComplaintRepository:
  async def get_one_by_any_id(self, identifier: str):
    # Simulate complaint document
    return {
      "_id": "69d227d0a83966acae571904",
      "complaint_id": "CMP-TEST-123",
      "title": "Network issue in lab",
      "description": "Internet down on 2nd floor",
      "priority": "MEDIUM",
      "status": "ASSIGNED",
      "created_at": datetime(2026, 4, 5, 9, 13, 50, tzinfo=timezone.utc),
      "department_id": "69cf5f5dcb8ec35c914c3eed",
      "created_by": "69cf5f5dcb8ec35c914c3eaa",
      "deadline": None,
    }


class FakeDepartmentRepository:
  async def find_by_id(self, department_id):
    if str(department_id) == "69cf5f5dcb8ec35c914c3eed":
      return {
        "_id": ObjectId("69cf5f5dcb8ec35c914c3eed"),
        "name": "ACADEMIC",
        "description": "Academic Dept",
        "default_priority": "LOW",
      }
    return None


class FakeUserRepository:
  async def find_by_id(self, user_id):
    uid = str(user_id)
    if uid == "69d22546a83966acae5718fd":
      return {"_id": ObjectId(uid), "name": "Faculty X", "email": "fx@example.com"}
    if uid == "69cf5f5dcb8ec35c914c3eaa":
      return {"_id": ObjectId(uid), "name": "Student Y", "email": "sy@example.com"}
    return None

  async def list_by_ids(self, user_ids):
    # Not needed for this test
    return []


class FakeFacultyAssignmentRepository:
  async def get_by_complaint(self, complaint_id):
    # Should be called with "69d227d0a83966acae571904"
    if str(complaint_id) in {"69d227d0a83966acae571904", str(ObjectId("69d227d0a83966acae571904"))}:
      return {
        "_id": ObjectId("69d227d0a83966acae571905"),
        "complaint_id": ObjectId("69d227d0a83966acae571904"),
        "faculty_id": ObjectId("69d22546a83966acae5718fd"),
        "department_id": ObjectId("69cf5f5dcb8ec35c914c3eed"),
        "assigned_at": datetime(2026, 4, 5, 9, 13, 52, tzinfo=timezone.utc),
        "assigned_by": None,
        "created_at": datetime(2026, 4, 5, 9, 13, 52, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 4, 5, 9, 13, 52, tzinfo=timezone.utc),
      }
    return None


class AdminComplaintDetailAssignedToTests(unittest.IsolatedAsyncioTestCase):
  async def test_assigned_to_user_is_fetched_by_faculty_id(self):
    service = AdminService()
    service.complaint_repository = FakeComplaintRepository()
    service.department_repository = FakeDepartmentRepository()
    service.user_repository = FakeUserRepository()
    service.faculty_assignment_repository = FakeFacultyAssignmentRepository()

    detail = await service.get_complaint_detail("69d227d0a83966acae571904")
    self.assertIsNotNone(detail)
    self.assertEqual(detail.assigned_to_name, "Faculty X")
    print("ASSIGNED_TO_USER_RESULT:", {"assigned_to_name": detail.assigned_to_name}, flush=True)

