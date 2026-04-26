from pydantic import BaseModel, Field
from typing import Optional

class StudentBase(BaseModel):
    register_number: str = Field(..., description="Unique registration number of the student")
    full_name: str
    department: str
    year: int = Field(..., ge=1, le=4)
    email: str

class StudentCreate(StudentBase):
    password: Optional[str] = Field(None, min_length=6)
    user_id: Optional[str] = None # Link to user account if created

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    email: Optional[str] = None

class StudentInDB(StudentBase):
    id: str = Field(alias="_id")

class StudentOut(StudentBase):
    id: str
