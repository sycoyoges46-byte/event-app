from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class RegistrationStatus(str, Enum):
    CONFIRMED = "confirmed"
    WAITLISTED = "waitlisted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class RegistrationBase(BaseModel):
    event_id: str
    register_number: str

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationInDB(RegistrationBase):
    id: str = Field(alias="_id")
    student_id: str
    status: RegistrationStatus = RegistrationStatus.CONFIRMED
    registration_date: datetime = Field(default_factory=datetime.utcnow)

class RegistrationOut(RegistrationBase):
    id: str
    student_name: str
    department: str
    year: int
    status: RegistrationStatus
    registration_date: datetime
