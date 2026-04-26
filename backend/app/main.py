from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, students, events, registrations, admin
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.core.config import settings
from contextlib import asynccontextmanager
import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="College Event Management System API",
    description="Backend for managing college internal events and student registrations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("=== GLOBAL ERROR CAUGHT ===")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal Server Error", "detail": str(exc)}
    )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(registrations.router, prefix="/api/registrations", tags=["Registrations"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to the College EMS API", "docs": "/docs"}
