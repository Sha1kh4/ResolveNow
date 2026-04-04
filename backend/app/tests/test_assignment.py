import unittest

from app.services.assignment_service import AssignmentService


class FakeDepartmentRepository:
    def __init__(self):
        self.departments = {}

    async def find_by_id(self, department_id):
        return self.departments.get(str(department_id))


class FakeFacultyAssignmentRepository:
    def __init__(self):
        self.assignments = []

    async def create(self, assignment_dict):
        self.assignments.append(assignment_dict)
        return assignment_dict

    async def get_latest_by_department(self, department_id):
        matching = [
            assignment
            for assignment in self.assignments
            if str(assignment["department_id"]) == str(department_id)
        ]
        return matching[-1] if matching else None


class FakeComplaintRepository:
    def __init__(self):
        self.updated_payloads = []

    async def update_assignment_status(self, complaint_id, *, status, updated_at):
        self.updated_payloads.append(
            {
                "complaint_id": complaint_id,
                "status": status,
                "updated_at": updated_at,
            }
        )


class AssignmentServiceTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.service = AssignmentService()
        self.service.department_repository = FakeDepartmentRepository()
        self.service.faculty_assignment_repository = FakeFacultyAssignmentRepository()
        self.service.complaint_repository = FakeComplaintRepository()

        self.department_id = "507f1f77bcf86cd799439031"
        self.faculty_one = "507f1f77bcf86cd799439021"
        self.faculty_two = "507f1f77bcf86cd799439022"
        self.service.department_repository.departments = {
            self.department_id: {
                "_id": self.department_id,
                "faculty_user_ids": [self.faculty_one, self.faculty_two],
            }
        }

    async def test_assign_complaint_uses_first_faculty_when_no_prior_assignment(self):
        complaint = {
            "_id": "507f1f77bcf86cd799439041",
            "department_id": self.department_id,
        }

        result = await self.service.assign_complaint(complaint)

        self.assertEqual(result["faculty_id"], self.faculty_one)
        self.assertEqual(result["status"], "ASSIGNED")
        self.assertEqual(len(self.service.faculty_assignment_repository.assignments), 1)
        self.assertEqual(
            str(self.service.faculty_assignment_repository.assignments[0]["faculty_id"]),
            self.faculty_one,
        )

    async def test_assign_complaint_rotates_to_next_faculty(self):
        complaint_one = {
            "_id": "507f1f77bcf86cd799439041",
            "department_id": self.department_id,
        }
        complaint_two = {
            "_id": "507f1f77bcf86cd799439042",
            "department_id": self.department_id,
        }

        await self.service.assign_complaint(complaint_one)
        result = await self.service.assign_complaint(complaint_two)

        self.assertEqual(result["faculty_id"], self.faculty_two)
        self.assertEqual(
            len(self.service.complaint_repository.updated_payloads),
            2,
        )
