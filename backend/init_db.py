import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import UserRole

async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    
    # Create Admin User
    admin_user = await db.users.find_one({"email": settings.ADMIN_USER})
    if not admin_user:
        print(f"Creating default admin user: {settings.ADMIN_USER}")
        await db.users.insert_one({
            "email": settings.ADMIN_USER,
            "hashed_password": get_password_hash(settings.ADMIN_PASSWORD),
            "role": UserRole.ADMIN,
            "is_active": True
        })
    else:
        print(f"Updating admin password for: {settings.ADMIN_USER}")
        await db.users.update_one(
            {"email": settings.ADMIN_USER},
            {"$set": {"hashed_password": get_password_hash(settings.ADMIN_PASSWORD)}}
        )

    # Create Indexes
    await db.students.create_index("register_number", unique=True)
    await db.users.create_index("email", unique=True)
    await db.registrations.create_index([("event_id", 1), ("register_number", 1)], unique=True)
    
    print("Database initialization complete")
    client.close()

if __name__ == "__main__":
    asyncio.run(init_db())
