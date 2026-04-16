# backend/app/main.py

import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import jobs, auth # <-- Import auth
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from backend.app.db.database import engine, Base
from backend.app.db.models import VideoJob,User

# --- THIS SECTION FIXES THE MODULE NOT FOUND ERROR ---
# 1. Get the path to the directory containing 'backend' and 'frontend' (project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
# 2. Insert the project root path into the system search path
sys.path.insert(0, str(PROJECT_ROOT))
# -----------------------------------------------------

# These imports should now work relative to the project root!
# The code will now look for 'backend.app.routers.jobs'
from backend.app.routers import jobs 


# --- FastAPI Application Instance ---
app = FastAPI(
    title="EditVerse AI Backend",
    version="1.0.0",
)
origins=["https://editverse-kxhkxivs1-shreyas-projects-ce459247.vercel.app",
                   "https://editverse-ai.vercel.app",
                   "https://editverse-backend.onrender.com",
                   "http://localhost:5173"]

Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
      # Allows requests from ANY website/IP
      allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# class CustomCORSMiddleware(BaseHTTPMiddleware):
#     async def dispatch(self, request, call_next):
#         origin = request.headers.get("origin")

#         # Allow localhost
#         allowed = [
#             "http://localhost:5173",
#             "https://editverse-ai.vercel.app",  # production
#         ]

#         # Allow ANY Vercel preview domain for your project
#         if origin and (
#             origin.endswith("vercel.app") and "editverse" in origin
#         ):
#             allowed.append(origin)

#         response = await call_next(request)

#         if origin in allowed:
#             response.headers["Access-Control-Allow-Origin"] = origin
#             response.headers["Access-Control-Allow-Credentials"] = "true"
#             response.headers["Access-Control-Allow-Headers"] = "*"
#             response.headers["Access-Control-Allow-Methods"] = "*"

#         return response


# app.add_middleware(CustomCORSMiddleware)

# ... rest of your code ...
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

app.include_router(auth.router, prefix="/auth", tags=["Auth"]) # <-- Add this

@app.get("/status")
async def get_status():
    return {"status": "ok", "service": app.title}

@app.get("/keep-alive")
def keep_alive():
    return {"status": "Awake and running!"}