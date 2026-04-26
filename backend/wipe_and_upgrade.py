import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def wipe_students():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    
    print("Wiping all student data and registrations...")
    await db.students.delete_many({})
    await db.registrations.delete_many({})
    # Delete users with role student
    await db.users.delete_many({"role": "student"})
    
    print("Database wiped successfully. Ready for account-based signup.")
    client.close()

if __name__ == "__main__":
    asyncio.run(wipe_students())
