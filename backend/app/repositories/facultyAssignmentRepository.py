from typing import Any, Optional

from app.config.database import get_database
from app.models.base_model import ObjectId


class FacultyAssignmentRepository:
    @property
    def collection(self) -> Any:
        return get_database()["faculty_assignments"]

    async def create(self, assignment_dict: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(assignment_dict)
        assignment_dict["_id"] = result.inserted_id
        return assignment_dict

    async def get_latest_by_department(self, department_id: Any) -> Optional[dict[str, Any]]:
        normalized_department_id = department_id
        if (
            isinstance(department_id, str)
            and hasattr(ObjectId, "is_valid")
            and ObjectId.is_valid(department_id)
        ):
            normalized_department_id = ObjectId(department_id)

        return await self.collection.find_one(
            {"department_id": normalized_department_id},
            sort=[("assigned_at", -1)],
        )
