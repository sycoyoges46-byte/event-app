from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.db.mongodb import get_database
from app.models.event import EventCreate, EventOut, EventUpdate
from app.api.deps import check_staff, get_current_user
from app.core.responses import success_response, error_response
from bson import ObjectId

router = APIRouter()

@router.post("")
async def create_event(event_in: EventCreate, _ = Depends(check_staff)):
    db = get_database()
    event_dict = event_in.dict()
    event_dict["current_registrations"] = 0
    result = await db.events.insert_one(event_dict)
    event_dict["id"] = str(result.inserted_id)
    if "_id" in event_dict:
        event_dict.pop("_id")
    return success_response("Event created successfully", event_dict)

@router.get("")
async def list_events(dept: Optional[str] = None):
    db = get_database()
    query = {"is_published": True}
    if dept:
        query["department"] = dept
        
    events = await db.events.find(query).to_list(100)
    for e in events:
        e["id"] = str(e["_id"])
        e.pop("_id")
    return success_response(f"Fetched {len(events)} events", events)

@router.get("/{event_id}")
async def get_event(event_id: str):
    db = get_database()
    try:
        event = await db.events.find_one({"_id": ObjectId(event_id)})
    except:
        return error_response("Invalid event ID format")
        
    if not event:
        return error_response("Event not found")
    event["id"] = str(event["_id"])
    event.pop("_id")
    return success_response("Event details fetched", event)

@router.put("/{event_id}")
async def update_event(event_id: str, event_in: EventUpdate, _ = Depends(check_staff)):
    db = get_database()
    update_data = {k: v for k, v in event_in.dict().items() if v is not None}
    try:
        result = await db.events.find_one_and_update(
            {"_id": ObjectId(event_id)},
            {"$set": update_data},
            return_document=True
        )
    except:
        return error_response("Invalid event ID format")
        
    if not result:
        return error_response("Event not found")
    result["id"] = str(result["_id"])
    result.pop("_id")
    return success_response("Event updated successfully", result)

@router.delete("/{event_id}")
async def delete_event(event_id: str, _ = Depends(check_staff)):
    db = get_database()
    try:
        result = await db.events.delete_one({"_id": ObjectId(event_id)})
    except:
        return error_response("Invalid event ID format")
        
    if result.deleted_count == 0:
        return error_response("Event not found")
    return success_response("Event deleted successfully")
