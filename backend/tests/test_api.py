import pytest
from httpx import AsyncClient
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the College EMS API"

@pytest.mark.asyncio
async def test_login_invalid():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", data={"username": "wrong@test.com", "password": "wrongpassword"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_event_unauthorized():
    event_data = {
        "name": "Tech Fest 2024",
        "description": "Annual technical festival",
        "organizer": "CSE Dept",
        "department": "CSE",
        "venue": "Main Auditorium",
        "date_time": "2024-05-20T10:00:00",
        "max_capacity": 500
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/events/", json=event_data)
    # Should be 401 since no token provided
    assert response.status_code == 401
