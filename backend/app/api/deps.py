from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from app.core.config import settings
from app.db.mongodb import get_database
from app.models.user import UserOut, UserRole
from bson import ObjectId
# Removed invalid import

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False
)

async def get_current_user(
    token: str = Depends(reusable_oauth2)
) -> UserOut:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = payload.get("sub")
        if token_data is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    db = get_database()
    try:
        uid = ObjectId(token_data)
        print(f"DEBUG: Looking for User ID: {uid}")
        user = await db.users.find_one({"_id": uid})
        if user:
            print(f"DEBUG: Found User: {user.get('email')}")
        else:
            print(f"DEBUG: User NOT found in database for ID: {uid}")
    except Exception as e:
        print(f"DEBUG: Error converting ID or searching: {str(e)}")
        raise HTTPException(status_code=403, detail="Invalid user ID format")
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserOut(id=str(user["_id"]), **user)

async def get_current_user_optional(
    token: Optional[str] = Depends(optional_oauth2)
) -> Optional[UserOut]:
    if not token:
        return None
    try:
        return await get_current_user(token)
    except:
        return None

def check_admin(user: UserOut = Depends(get_current_user)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return user

def check_staff(user: UserOut = Depends(get_current_user)):
    if user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return user
