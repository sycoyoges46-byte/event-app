import sys
try:
    import motor
    import pydantic
    import fastapi
    print("CORE LIBS: OK")
except ImportError as e:
    print(f"MISSING LIB: {e}")

from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_conn():
    print(f"Testing connection to: {settings.MONGO_URI}")
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        # The is_master command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MONGODB CONNECTION: OK")
    except Exception as e:
        print(f"MONGODB CONNECTION: FAILED - {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
