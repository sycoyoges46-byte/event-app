from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    STUDENT = "student"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str

class UserOut(UserBase):
    id: str
