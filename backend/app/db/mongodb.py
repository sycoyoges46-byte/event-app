from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    """
    Establish connection to MongoDB and select the isolated database.
    This ensures we never touch other databases in the cluster.
    """
    logging.info(f"Connecting to MongoDB cluster at {settings.MONGO_URI}...")
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
        
        # EXPLICIT ISOLATION: Always select the specific DB
        # This prevents interference with other project DBs in the same cluster
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Validate connection by pinging
        await db_instance.client.admin.command('ping')
        logging.info(f"Successfully connected to isolated database: {settings.DB_NAME}")
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    if db_instance.client:
        logging.info("Closing MongoDB connection...")
        db_instance.client.close()
        logging.info("MongoDB connection closed")

def get_database():
    """
    Getter for the isolated database instance.
    """
    if db_instance.db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db_instance.db
