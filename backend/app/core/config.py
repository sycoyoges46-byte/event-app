from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "college_event_system_db"
    
    JWT_SECRET_KEY: str = "supersecretkey_for_development"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    ADMIN_USER: str = "admin@college.edu"
    ADMIN_PASSWORD: str = "admin123"

    class Config:
        env_file = ".env"

settings = Settings()
