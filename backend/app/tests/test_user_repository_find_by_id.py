import unittest
from datetime import datetime, timezone

from app.repositories.user_repository import UserRepository
from app.repositories import user_repository as user_repo_module
from app.models.base_model import ObjectId


class FakeUsersCollection:
    def __init__(self, docs_by_id):
        self.docs_by_id = docs_by_id

    def find_one(self, filter_query):
        # Expecting {"_id": <ObjectId or str>}
        key = filter_query.get("_id")
        key_str = str(key)
        return self.docs_by_id.get(key_str)


class FakeDB:
    def __init__(self, users_collection):
        self._users = users_collection

    def __getitem__(self, name: str):
        if name == "users":
            return self._users
        raise KeyError(name)


class UserRepositoryFindByIdTests(unittest.TestCase):
    def test_find_by_id_returns_full_document(self):
        # Target faculty id provided by user
        target_id = "69d22546a83966acae5718fd"
        target_oid = ObjectId(target_id)

        # Seed a fake user document
        user_doc = {
            "_id": target_oid,
            "name": "PranavB",
            "email": "pranavtheboss@yopmail.com",
            "password_hash": "712bac3c3ff1ad8b7961313da3632564:a0b47cc9061da6f7dee079700ba1486359ab93338ecb542be169768d0e13b755",
            "role": "faculty",
            "user_status": "active",
            "is_email_verified": True,
            "is_active": True,
            "email_verification": {
                "token_hash": "ba0c32695671c922c5f212bd5d07eb1ac898364d0b6ecc2ade2f04a92814615a",
                "expires_at": datetime(2026, 4, 6, 9, 3, 1, 928000, tzinfo=timezone.utc),
                "sent_at": datetime(2026, 4, 5, 9, 3, 1, 928000, tzinfo=timezone.utc),
                "verified_at": datetime(2026, 4, 5, 9, 3, 29, 834000, tzinfo=timezone.utc),
            },
            "refresh_tokens": [],
            "created_at": datetime(2026, 4, 5, 9, 3, 1, 928000, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 4, 5, 9, 4, 41, 748000, tzinfo=timezone.utc),
        }

        # Monkeypatch get_database used inside UserRepository to our fake DB
        fake_db = FakeDB(FakeUsersCollection({str(target_oid): user_doc}))
        user_repo_module.get_database = lambda: fake_db

        repo = UserRepository()
        result = user_repo_module._run_db_call(repo.collection.find_one, {"_id": target_oid})
        # _run_db_call may be async or sync; ensure we resolve it
        if hasattr(result, "__await__"):
            result = __import__("asyncio").get_event_loop().run_until_complete(result)

        # Alternatively, call repository API which uses normalization logic
        found = __import__("asyncio").get_event_loop().run_until_complete(repo.find_by_id(target_id))

        # Print the full document returned by find_by_id
        print(
            "USER_DOC_RESULT:",
            {
                "_id": str(found["_id"]),
                "name": found.get("name"),
                "email": found.get("email"),
                "role": found.get("role"),
                "user_status": found.get("user_status"),
                "created_at": found.get("created_at").isoformat() if found.get("created_at") else None,
                "updated_at": found.get("updated_at").isoformat() if found.get("updated_at") else None,
                "is_email_verified": found.get("is_email_verified"),
                "is_active": found.get("is_active"),
                "email_verification": {
                    "token_hash": found.get("email_verification", {}).get("token_hash"),
                    "expires_at": found.get("email_verification", {}).get("expires_at").isoformat()
                    if found.get("email_verification", {}).get("expires_at") else None,
                    "sent_at": found.get("email_verification", {}).get("sent_at").isoformat()
                    if found.get("email_verification", {}).get("sent_at") else None,
                    "verified_at": found.get("email_verification", {}).get("verified_at").isoformat()
                    if found.get("email_verification", {}).get("verified_at") else None,
                },
                "refresh_tokens": found.get("refresh_tokens", []),
            },
            flush=True,
        )

        # Basic assertions
        self.assertIsNotNone(found)
        self.assertEqual(str(found["_id"]), target_id)
        self.assertEqual(found["name"], "PranavB")


