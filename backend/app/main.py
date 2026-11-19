
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import models
from .routes import router, skills_router
from .auth import auth_router


# Initialize database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application FIRST
app = FastAPI(
    title="AI Academic & Career Intelligence Platform",
    description="Backend API for personalized academic and career intelligence.",
    version="1.0.0"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers AFTER creating app
app.include_router(router)
app.include_router(skills_router)
app.include_router(auth_router)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "AI Academic & Career Intelligence Platform API",
        "status": "running"
    }


# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
