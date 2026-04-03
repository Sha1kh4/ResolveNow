from typing import Any, Optional

from app.config.database import get_database
from app.models.base_model import ObjectId


class DepartmentRepository:
    @property
    def collection(self) -> Any:
        return get_database()["departments"]

    async def list_all(self) -> list[dict[str, Any]]:
        departments_cursor = self.collection.find({}).sort("name", 1)
        return await departments_cursor.to_list(length=None)

    async def find_by_id(self, department_id: Any) -> Optional[dict[str, Any]]:
        normalized_department_id = department_id
        if (
            isinstance(department_id, str)
            and hasattr(ObjectId, "is_valid")
            and ObjectId.is_valid(department_id)
        ):
            normalized_department_id = ObjectId(department_id)
        return await self.collection.find_one({"_id": normalized_department_id})

    async def list_by_ids(self, department_ids: list[Any]) -> list[dict[str, Any]]:
        if not department_ids:
            return []
        departments_cursor = self.collection.find({"_id": {"$in": department_ids}})
        return await departments_cursor.to_list(length=None)

    async def remove_faculty_from_all_departments(self, user_id: Any, updated_at: Any) -> None:
        await self.collection.update_many(
            {"faculty_user_ids": user_id},
            {
                "$pull": {"faculty_user_ids": user_id},
                "$set": {"updated_at": updated_at},
            },
        )

    async def assign_faculty_to_department(
        self,
        department_id: Any,
        user_id: Any,
        updated_at: Any,
    ) -> None:
        await self.collection.update_one(
            {"_id": department_id},
            {
                "$addToSet": {"faculty_user_ids": user_id},
                "$set": {"updated_at": updated_at},
            },
        )
