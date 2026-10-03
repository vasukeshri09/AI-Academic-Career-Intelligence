from fastapi import FastAPI

from .database import engine, Base
from . import models
from .routes import router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Academic & Career Intelligence Platform",
    description="Backend API for personalized academic and career intelligence.",
    version="0.1.0"
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "AI Academic & Career Intelligence Platform API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }