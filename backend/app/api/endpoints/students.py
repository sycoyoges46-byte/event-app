from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.db.mongodb import get_database
from app.models.student import StudentCreate, StudentOut, StudentUpdate
from app.models.user import UserOut, UserRole
from app.api.deps import check_admin, check_staff, get_current_user, get_current_user_optional
from app.core.responses import success_response, error_response
from bson import ObjectId

router = APIRouter()

from app.core.security import get_password_hash
from app.models.user import UserRole

@router.post("")
async def create_student(student_in: StudentCreate, current_user: Optional[UserOut] = Depends(get_current_user_optional)):
    db = get_database()
    
    # 1. Check if student profile already exists for this register number
    existing_reg = await db.students.find_one({"register_number": student_in.register_number})
    if existing_reg:
        return error_response("Student already registered with this Register Number")
    
    user_id = None

    # 2. Handle User Account
    if current_user:
        # User is already logged in, check if they already have a student profile
        existing_profile = await db.students.find_one({"user_id": current_user.id})
        if existing_profile:
            return error_response("You already have a student profile linked to your account")
        user_id = current_user.id
    else:
        # No user logged in, check if email is taken
        if not student_in.password:
            return error_response("Password is required to create a new account")
            
        existing_user = await db.users.find_one({"email": student_in.email})
        if existing_user:
            return error_response("An account with this email already exists. Please log in first.")

        # Create new User Account
        user_dict = {
            "email": student_in.email,
            "hashed_password": get_password_hash(student_in.password),
            "role": UserRole.STUDENT,
            "full_name": student_in.full_name,
            "is_active": True
        }
        user_result = await db.users.insert_one(user_dict)
        user_id = str(user_result.inserted_id)

    # 3. Create Student Profile linked to User
    student_dict = student_in.dict()
    if "password" in student_dict:
        student_dict.pop("password") 
    student_dict["user_id"] = user_id
    
    try:
        result = await db.students.insert_one(student_dict)
    except Exception as e:
        return error_response(f"Database error: {str(e)}")

    student_dict["id"] = str(result.inserted_id)
    if "_id" in student_dict:
        student_dict.pop("_id")
        
    return success_response("Student profile created successfully", student_dict)

@router.get("/{register_number}")
async def get_student_by_reg_no(register_number: str):
    db = get_database()
    student = await db.students.find_one({"register_number": register_number})
    if not student:
        return error_response("Student not found")
    student["id"] = str(student["_id"])
    student.pop("_id")
    return success_response("Student details fetched", student)

@router.get("")
async def list_students(dept: Optional[str] = None, year: Optional[int] = None, _ = Depends(check_staff)):
    db = get_database()
    query = {}
    if dept:
        query["department"] = dept
    if year:
        query["year"] = year
        
    students = await db.students.find(query).to_list(1000)
    for s in students:
        s["id"] = str(s["_id"])
        s.pop("_id")
    return success_response(f"Found {len(students)} students", students)

@router.put("/{register_number}")
async def update_student(register_number: str, student_in: StudentUpdate, current_user: UserOut = Depends(get_current_user)):
    db = get_database()
    
    # Authorization: Only owner or admin/staff can update
    if current_user.role == UserRole.STUDENT:
        student = await db.students.find_one({"user_id": current_user.id})
        if not student or student["register_number"] != register_number:
            return error_response("Unauthorized: You can only update your own profile", status_code=403)

    update_data = {k: v for k, v in student_in.dict().items() if v is not None}
    
    result = await db.students.find_one_and_update(
        {"register_number": register_number},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        return error_response("Student not found")
        
    result["id"] = str(result["_id"])
    result.pop("_id")
    return success_response("Student profile updated", result)
