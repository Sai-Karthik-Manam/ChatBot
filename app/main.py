import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.chat_router import router as chat_router

# Create FastAPI application
app = FastAPI(
    title="AI Support Chatbot",
    description="AI-powered application support chatbot API for .NET 4.8",
    version="1.0.0"
)

# Enable CORS for .NET Web Apps (MVC, WebForms, local dev IIS Express, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your specific web domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(chat_router)

# Mount widget directory for direct script inclusion & preview
widget_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "widget")
if os.path.isdir(widget_dir):
    app.mount("/widget", StaticFiles(directory=widget_dir, html=True), name="widget")


# Default API endpoint
@app.get("/")
def home():
    return {
        "message": "AI Chatbot API is running successfully",
        "endpoints": {
            "health": "/health",
            "chat": "/api/v1/chat",
            "widget_preview": "/widget/chatbot-widget.html"
        }
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
