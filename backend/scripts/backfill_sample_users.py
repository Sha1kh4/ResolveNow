import asyncio

from app.config.database import close_mongo_connection, connect_to_mongo
from app.seeds.user_seed import insert_missing_sample_users


async def main() -> None:
    await connect_to_mongo()
    try:
        result = await insert_missing_sample_users()
        print(
            f"Sample user backfill completed: inserted={result['inserted']} skipped={result['skipped']}"
        )
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
