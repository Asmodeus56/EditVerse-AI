# backend/createdb.py
import os
import sys
from pathlib import Path

# --- Fixes Import Errors ---
# Adds the 'backend' directory to the path so 'app' can be found
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))
# ---------------------------

# Imports all models and the connection engine
from backend.app.db.database import Base, engine
from backend.app.db.models import VideoJob 
# NOTE: Ensure VideoJob model is fully defined in app/db/models.py

print("Attempting to create database tables...")
# This command creates tables defined in Base if they don't already exist
Base.metadata.create_all(bind=engine)
print("Database tables created successfully (if they didn't exist).")