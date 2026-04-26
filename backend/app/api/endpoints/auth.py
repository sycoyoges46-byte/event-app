from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token, get_password_hash
from app.db.mongodb import get_database
from app.api.deps import check_admin, get_current_user
from app.models.user import UserOut, UserRole, UserCreate
from app.core.responses import success_response, error_response
from bson import ObjectId

router = APIRouter()

@router.get("/me")
async def get_me(current_user: UserOut = Depends(get_current_user)):
    db = get_database()
    user_data = current_user.dict()
    if current_user.role == UserRole.STUDENT:
        student = await db.students.find_one({"user_id": current_user.id})
        if student:
            user_data["register_number"] = student["register_number"]
            user_data["full_name"] = student["full_name"]
            user_data["department"] = student["department"]
            user_data["year"] = student["year"]
    return success_response("User data fetched", user_data)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"DEBUG: Login attempt for user: {form_data.username}")
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        print(f"DEBUG: User not found: {form_data.username}")
        return error_response("Incorrect email or password")
    
    is_valid = verify_password(form_data.password, user["hashed_password"])
    print(f"DEBUG: Password verification for {form_data.username}: {is_valid}")
    
    if not is_valid:
        return error_response("Incorrect email or password")
    
    uid_str = str(user["_id"])
    print(f"DEBUG: Creating token for User ID: {uid_str}")
    access_token = create_access_token(subject=uid_str)
    return success_response("Login successful", {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user["role"]
    })

@router.post("/signup")
async def signup(user_in: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        return error_response("User already exists")
    
    user_dict = user_in.dict()
    password = user_dict.pop("password")
    user_dict["hashed_password"] = get_password_hash(password)
    
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    user_dict.pop("hashed_password") # Remove for response
    return success_response("User created successfully", user_dict)
