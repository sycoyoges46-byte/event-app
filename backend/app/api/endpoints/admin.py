from fastapi import APIRouter, Depends
from app.db.mongodb import get_database
from app.api.deps import check_admin
from app.core.responses import success_response, error_response
from typing import Dict, Any

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(_ = Depends(check_admin)):
    db = get_database()
    
    total_students = await db.students.count_documents({})
    total_events = await db.events.count_documents({})
    total_registrations = await db.registrations.count_documents({})
    
    confirmed = await db.registrations.count_documents({"status": "confirmed"})
    waitlisted = await db.registrations.count_documents({"status": "waitlisted"})
    
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    dept_distribution = await db.students.aggregate(pipeline).to_list(100)
    
    data = {
        "summary": {
            "total_students": total_students,
            "total_events": total_events,
            "total_registrations": total_registrations,
            "confirmed_registrations": confirmed,
            "waitlisted_registrations": waitlisted
        },
        "department_distribution": {d["_id"]: d["count"] for d in dept_distribution}
    }
    return success_response("Stats fetched successfully", data)
