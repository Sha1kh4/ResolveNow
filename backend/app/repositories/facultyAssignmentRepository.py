from typing import Any, Optional

from app.config.database import get_database
from app.models.base_model import ObjectId

class FacultyAssignmentRepository:
     @property
     def collection(self) -> Any:
        return get_database()["departments"]


     async def create(self, assignment_dict):
        await self.collection.insert_one(assignment_dict)