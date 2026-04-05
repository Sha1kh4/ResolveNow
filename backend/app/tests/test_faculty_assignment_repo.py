import unittest
from datetime import datetime, timedelta
from app.models.base_model import ObjectId

from app.repositories.facultyAssignmentRepository import FacultyAssignmentRepository
from app.repositories import facultyAssignmentRepository as repo_module


class FakeFacultyAssignmentsCollection:
  def __init__(self, docs):
    self.docs = docs

  async def find_one(self, filter, sort=None):
    """
    Simulate MongoDB find_one with optional sort=[("assigned_at", -1)].
    """
    # Basic filter on complaint_id equality
    complaint_id = filter.get("complaint_id")
    matches = [d for d in self.docs if d.get("complaint_id") == complaint_id]
    if not matches:
      return None
    if sort:
      # Support sort by assigned_at descending when [("assigned_at", -1)]
      key, direction = sort[0]
      reverse = direction == -1
      matches.sort(key=lambda d: d.get(key) or datetime.min, reverse=reverse)
    # Return first after sorting
    return matches[0]


class FacultyAssignmentRepositoryTests(unittest.IsolatedAsyncioTestCase):
  async def test_get_latest_by_complaint_returns_latest_assignment(self):
    repo = FacultyAssignmentRepository()

    # complaint id provided by user
    complaint_oid = ObjectId("69d227d0a83966acae571904")

    # Two assignments for the same complaint; the later one should be returned
    base_time = datetime.utcnow()
    older = {
      "_id": "507f1f77bcf86cd7994390aa",
      "complaint_id": complaint_oid,
      "faculty_id": ObjectId("507f1f77bcf86cd799439021"),
      "assigned_at": base_time - timedelta(hours=1),
    }
    newer = {
      "_id": "507f1f77bcf86cd7994390ab",
      "complaint_id": complaint_oid,
      "faculty_id": ObjectId("507f1f77bcf86cd799439022"),
      "assigned_at": base_time,
    }

    # Monkeypatch get_database() to return our fake DB with the fake collection
    class FakeDB:
      def __init__(self, coll):
        self._coll = coll
      def __getitem__(self, name: str):
        if name == "faculty_assignments":
          return self._coll
        raise KeyError(name)
    repo_module.get_database = lambda: FakeDB(FakeFacultyAssignmentsCollection([older, newer]))

    result = await repo.get_latest_by_complaint(str(complaint_oid))
    # Validate we got the newest record
    self.assertIsNotNone(result)
    self.assertEqual(str(result["complaint_id"]), str(complaint_oid))
    self.assertEqual(str(result["faculty_id"]), "507f1f77bcf86cd799439022")
    # Print the result so the user can see it
    print(
      "LATEST_ASSIGNMENT_RESULT:",
      {
        "_id": str(result["_id"]),
        "complaint_id": str(result["complaint_id"]),
        "faculty_id": str(result["faculty_id"]),
        "assigned_at": result["assigned_at"].isoformat(),
      },
      flush=True,
    )

  async def test_get_by_complaint_returns_exact_record(self):
    repo = FacultyAssignmentRepository()

    # From user-provided record
    record = {
      "_id": "69d227d0a83966acae571905",
      "complaint_id": ObjectId("69d227d0a83966acae571904"),
      "faculty_id": ObjectId("69d22546a83966acae5718fd"),
      "department_id": ObjectId("69cf5f5dcb8ec35c914c3eed"),
      "assigned_at": datetime.fromisoformat("2026-04-05T09:13:52.383+00:00"),
      "assigned_by": None,
      "created_at": datetime.fromisoformat("2026-04-05T09:13:52.383+00:00"),
      "updated_at": datetime.fromisoformat("2026-04-05T09:13:52.383+00:00"),
    }

    class FakeDB:
      def __init__(self, coll):
        self._coll = coll
      def __getitem__(self, name: str):
        if name == "faculty_assignments":
          return self._coll
        raise KeyError(name)

    repo_module.get_database = lambda: FakeDB(FakeFacultyAssignmentsCollection([record]))

    # Call using complaint_id as string
    result = await repo.get_by_complaint("69d227d0a83966acae571904")
    self.assertIsNotNone(result)
    self.assertEqual(str(result["_id"]), "69d227d0a83966acae571905")
    self.assertEqual(str(result["complaint_id"]), "69d227d0a83966acae571904")
    self.assertEqual(str(result["faculty_id"]), "69d22546a83966acae5718fd")
    self.assertEqual(str(result["department_id"]), "69cf5f5dcb8ec35c914c3eed")

    print(
      "GET_BY_COMPLAINT_RESULT:",
      {
        "_id": str(result["_id"]),
        "complaint_id": str(result["complaint_id"]),
        "faculty_id": str(result["faculty_id"]),
        "department_id": str(result["department_id"]),
        "assigned_at": result["assigned_at"].isoformat(),
        "created_at": result["created_at"].isoformat(),
        "updated_at": result["updated_at"].isoformat(),
      },
      flush=True,
    )

