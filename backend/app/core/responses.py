from typing import Any, Optional
from pydantic import BaseModel

class APIResponse(BaseModel):
    status: str
    message: str
    data: Optional[Any] = None

def success_response(message: str, data: Any = None) -> dict:
    return {
        "status": "success",
        "message": message,
        "data": data
    }

def error_response(message: str, data: Any = None) -> dict:
    return {
        "status": "error",
        "message": message,
        "data": data
    }
