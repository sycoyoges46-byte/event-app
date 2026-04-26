from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.db.mongodb import get_database
from app.models.registration import RegistrationCreate, RegistrationOut, RegistrationStatus
from app.api.deps import check_staff, get_current_user
from app.models.user import UserOut, UserRole
from app.services.notifications import notification_service
from app.core.responses import success_response, error_response
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def register_for_event(reg_in: RegistrationCreate, current_user: UserOut = Depends(get_current_user)):
    db = get_database()
    
    # 0. Authorization: Students can only register for themselves
    if current_user.role == UserRole.STUDENT:
        # Find the student profile linked to this user
        logged_in_student = await db.students.find_one({"user_id": current_user.id})
        if not logged_in_student or logged_in_student["register_number"] != reg_in.register_number:
            return error_response("Unauthorized: You can only register using your own registration number.", status_code=403)
    
    # 1. Validate Student
    student = await db.students.find_one({"register_number": reg_in.register_number})
    if not student:
        return error_response("Student profile not found. Please create a profile first.")
    
    # 2. Validate Event
    try:
        event = await db.events.find_one({"_id": ObjectId(reg_in.event_id)})
    except:
        return error_response("Invalid event ID")
        
    if not event:
        return error_response("Event not found")
    
    if not event.get("is_published", True):
        return error_response("Event is not open for registration")

    # 3. Check Eligibility
    if event.get("eligibility_dept") and student["department"] not in event["eligibility_dept"]:
        return error_response(f"Restricted to departments: {', '.join(event['eligibility_dept'])}")
    
    if event.get("eligibility_year") and student["year"] not in event["eligibility_year"]:
        return error_response(f"Restricted to years: {', '.join(map(str, event['eligibility_year']))}")

    # 4. Check for duplicate registration
    existing = await db.registrations.find_one({
        "event_id": reg_in.event_id,
        "register_number": reg_in.register_number
    })
    if existing:
        return error_response("Student is already registered for this event")

    # 5. Atomic Capacity Check and Increment
    status_val = RegistrationStatus.CONFIRMED
    
    # Attempt to atomically increment the count ONLY if it is less than max_capacity
    result = await db.events.update_one(
        {
            "_id": ObjectId(reg_in.event_id),
            "current_registrations": {"$lt": event["max_capacity"]}
        },
        {"$inc": {"current_registrations": 1}}
    )
    
    # If no document was modified, it means capacity was reached
    if result.modified_count == 0:
        status_val = RegistrationStatus.WAITLISTED

    # 6. Create Registration
    reg_dict = {
        "event_id": reg_in.event_id,
        "register_number": reg_in.register_number,
        "student_id": str(student["_id"]),
        "status": status_val,
        "registration_date": datetime.utcnow()
    }
    
    insert_result = await db.registrations.insert_one(reg_dict)
    
    # Notify student
    if student.get("email"):
        await notification_service.send_registration_confirmation(
            student["email"], 
            event["name"], 
            status_val
        )
    
    data = {
        "id": str(insert_result.inserted_id),
        "event_id": reg_in.event_id,
        "register_number": reg_in.register_number,
        "student_name": student["full_name"],
        "status": status_val,
        "registration_date": reg_dict["registration_date"]
    }
    
    msg = "Registration confirmed" if status_val == RegistrationStatus.CONFIRMED else "Added to waitlist"
    return success_response(msg, data)

@router.get("/event/{event_id}")
async def list_event_registrations(event_id: str, _ = Depends(check_staff)):
    db = get_database()
    registrations = await db.registrations.find({"event_id": event_id}).to_list(1000)
    
    enriched_regs = []
    for reg in registrations:
        student = await db.students.find_one({"_id": ObjectId(reg["student_id"])})
        enriched_regs.append({
            "id": str(reg["_id"]),
            "event_id": reg["event_id"],
            "register_number": reg["register_number"],
            "student_name": student["full_name"] if student else "Unknown",
            "department": student["department"] if student else "N/A",
            "year": student["year"] if student else 0,
            "status": reg["status"],
            "registration_date": reg["registration_date"]
        })
    return success_response(f"Fetched {len(enriched_regs)} registrations", enriched_regs)

@router.get("/student/{register_number}")
async def list_student_registrations(register_number: str, current_user: UserOut = Depends(get_current_user)):
    db = get_database()
    
    # Authorization: Students can only see their own registrations
    if current_user.role == UserRole.STUDENT:
        logged_in_student = await db.students.find_one({"user_id": current_user.id})
        if not logged_in_student or logged_in_student["register_number"] != register_number:
            return error_response("Unauthorized: You can only view your own registrations.", status_code=403)
    registrations = await db.registrations.find({"register_number": register_number}).to_list(100)
    
    enriched_regs = []
    for reg in registrations:
        event = await db.events.find_one({"_id": ObjectId(reg["event_id"])})
        student = await db.students.find_one({"_id": ObjectId(reg["student_id"])})
        enriched_regs.append({
            "id": str(reg["_id"]),
            "event_name": event["name"] if event else "Unknown",
            "register_number": reg["register_number"],
            "status": reg["status"],
            "registration_date": reg["registration_date"]
        })
    return success_response(f"Fetched {len(enriched_regs)} registrations", enriched_regs)

@router.delete("/{registration_id}")
async def cancel_registration(registration_id: str, current_user: UserOut = Depends(get_current_user)):
    db = get_database()
    
    try:
        reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    except:
        return error_response("Invalid registration ID")
        
    if not reg:
        return error_response("Registration not found")
    
    # Authorization: Only owner or admin/staff can cancel
    if current_user.role == UserRole.STUDENT:
        student = await db.students.find_one({"user_id": current_user.id})
        if not student or str(student["_id"]) != reg["student_id"]:
            return error_response("Unauthorized: You can only cancel your own registrations", status_code=403)

    # 1. Delete the registration
    await db.registrations.delete_one({"_id": ObjectId(registration_id)})
    
    # 2. Handle Event Capacity and Waitlist
    if reg["status"] == RegistrationStatus.CONFIRMED:
        # Check if there's someone on the waitlist to promote
        next_in_waitlist = await db.registrations.find_one(
            {"event_id": reg["event_id"], "status": RegistrationStatus.WAITLISTED},
            sort=[("registration_date", 1)]
        )
        
        if next_in_waitlist:
            # Promote the next person
            await db.registrations.update_one(
                {"_id": next_in_waitlist["_id"]},
                {"$set": {"status": RegistrationStatus.CONFIRMED}}
            )
            # No need to decrement event count because a spot was freed and immediately filled
        else:
            # No one on waitlist, just decrement the count
            await db.events.update_one(
                {"_id": ObjectId(reg["event_id"])},
                {"$inc": {"current_registrations": -1}}
            )
            
    return success_response("Registration cancelled successfully")
