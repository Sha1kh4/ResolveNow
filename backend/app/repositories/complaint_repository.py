from typing import Any

from app.config.database import get_database


class ComplaintRepository:
    @property
    def collection(self) -> Any:
        return get_database()["complaints"]

    async def count_with_filters(self, filters: dict[str, Any]) -> int:
        return await self.collection.count_documents(filters)

    async def list_with_filters(
        self,
        filters: dict[str, Any],
        *,
        skip: int,
        limit: int,
    ) -> list[dict[str, Any]]:
        complaints_cursor = (
            self.collection.find(filters).sort("created_at", -1).skip(skip).limit(limit)
        )
        return await complaints_cursor.to_list(length=None)
