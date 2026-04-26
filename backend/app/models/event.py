from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EventBase(BaseModel):
    name: str
    description: str
    organizer: str
    department: str
    venue: str
    date_time: datetime
    max_capacity: int = Field(..., gt=0)
    eligibility_dept: Optional[List[str]] = None
    eligibility_year: Optional[List[int]] = None
    is_published: bool = True

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    organizer: Optional[str] = None
    department: Optional[str] = None
    venue: Optional[str] = None
    date_time: Optional[datetime] = None
    max_capacity: Optional[int] = None
    eligibility_dept: Optional[List[str]] = None
    eligibility_year: Optional[List[int]] = None
    is_published: Optional[bool] = None

class EventInDB(EventBase):
    id: str = Field(alias="_id")
    current_registrations: int = 0

class EventOut(EventBase):
    id: str
    current_registrations: int
