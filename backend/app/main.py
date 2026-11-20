from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.prediction import router as prediction_router
from app.routes.auth import router as auth_router
from app.routes.buildings import router as buildings_router
from app.database import init_db

# Initialize database
init_db()

app = FastAPI(
    title="AI Renewable Energy Optimization API",
    description="API for electricity demand prediction and solar-grid energy optimization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(buildings_router)

@app.get("/")
def root():
    return {
        "message": "AI Renewable Energy Optimization API is running successfully!"
    }


@app.get("/health")
def health_check():
    # In this architecture models are loaded on startup in prediction_service
    # If the app is running, they are loaded.
    return {
        "status": "ok",
        "models_loaded": True
    }


app.include_router(prediction_router)