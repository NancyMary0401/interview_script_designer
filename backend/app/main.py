from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.api_v1.api import api_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Interview Script Designer API",
    description="API for generating and managing technical interview scripts",
    version="0.1.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to the Interview Script Designer API"}

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Interview Script Designer API")
    # Initialize database connection here if needed

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Interview Script Designer API")
    # Close database connection here if needed
