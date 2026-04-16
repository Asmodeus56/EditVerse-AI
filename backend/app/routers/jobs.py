from fastapi import APIRouter, File, UploadFile, Depends,HTTPException,BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid
import os
from fastapi.security import OAuth2PasswordBearer
from backend.app.core.security import decode_access_token


# Import modules from your project structure
from backend.app.db.database import get_db
from backend.app.db.models import VideoJob
from backend.app.tasks import dummy_video_processing,process_video_edit
from backend.app.core.config import settings
from backend.app.core.schemas import PromptRequest,JobStatusResponse
from typing import List
from backend.app.core.schemas import JobSummary # Import new schema
from backend.app.db.models import User


# --- 1. Define the APIRouter Instance ---
# This is the 'router' object that main.py needs to import.
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ----------------------------------------

def get_current_user_id(token: str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    
    # payload = decode_access_token(token)
    user_id_str = decode_access_token(token)
    if not user_id_str:
        print(f"🔒 [AUTH] Token validation FAILED — token was invalid or expired")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = int(user_id_str)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"🔒 [AUTH] User id={user_id} from token NOT FOUND in database")
        raise HTTPException(status_code=404, detail="User not found")

    print(f"✅ [AUTH] Authenticated user_id={user_id}")
    return user_id


# Define a storage location relative to the project root (EditVerseAi)
# Ensure this folder exists or create it!
# NOTE: In production, this would be AWS S3 or Supabase Storage.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "temp_storage"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)



print(f"DEBUG: Server will save files to: {UPLOAD_DIR}")
# ---------------------------------------------
@router.get("/history", response_model=List[JobSummary])
def get_job_history(user_id: int = Depends(get_current_user_id),db: Session = Depends(get_db)):
    """
    Returns the list of recent projects.
    """
    
    # Order by newest first
    jobs = db.query(VideoJob).filter(VideoJob.user_id==user_id).order_by(VideoJob.created_at.desc()).limit(10).all()
    
    return [
        {
            "id": str(job.id),
            "status": job.status,
            "original_file": job.original_file_path,
            "created_at": str(job.created_at)
        }
        for job in jobs
    ]

@router.post("/upload")
async def upload_video(background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    # db is injected automatically by FastAPI, based on your database.py
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Handles the upload of a video file, saves it locally, and creates a
    PENDING job entry in the database.
    """
    print(f"📤 [UPLOAD] Received upload request from user_id={user_id}, file={file.filename}, size={file.size}")
    
    # 1. Generate a unique filename and define the final path
    # We use a UUID to ensure the filename is unique, preventing overwrites.
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    print(f"📂 [UPLOAD] Saving to: {file_path}")

    # 2. Save the file locally using efficient stream copying
    try:
        # Open the destination file in binary write mode
        with open(file_path, "wb") as buffer:
            # Use shutil to efficiently copy the contents of the uploaded file
            shutil.copyfileobj(file.file, buffer)
        print(f"✅ [UPLOAD] File saved successfully: {unique_filename}")
    except Exception as e:
        print(f"❌ [UPLOAD] File save error: {e}")
        return {"message": "There was an error saving the uploaded file.", "error": str(e)}
    finally:
        # Important: Close the UploadFile object
        await file.close()

    # 3. Create a PENDING job record in the database
    try:
        new_job = VideoJob(
            user_id=user_id,
            original_file_path=str(file_path),
            prompt="Awaiting user prompt...",
            status="UPLOADED"
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job) # Reload the job object to get its generated ID
        print(f"✅ [UPLOAD] Job created in DB: job_id={new_job.id}")
    except Exception as e:
        print(f"❌ [UPLOAD] DB error creating job: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    background_tasks.add_task(dummy_video_processing, str(new_job.id), unique_filename)
    print(f"🚀 [UPLOAD] Background processing queued for job_id={new_job.id}")

    return {
        "message": "File uploaded successfully. Ready for prompt submission.",
        "filename": unique_filename,
        "job_id": new_job.id,
        "status": new_job.status
        
    }


@router.post("/{job_id}/prompt")
async def submit_prompt(
    job_id: str, 
    request: PromptRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    User sends a text prompt. We update DB and trigger the Edit Worker.
    """
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Update DB
    job.prompt = request.prompt
    job.status = "QUEUED" # Reset status to queued for editing
    db.commit()

    # Trigger Celery Task
    # process_video_edit.delay(job_id, request.prompt)
    background_tasks.add_task(process_video_edit, job_id, request.prompt)

    return {"message": "Prompt received. Editing started.", "status": "QUEUED"}

# --- 2. CHECK STATUS ---
@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """
    Frontend polls this to check if 'status' is 'COMPLETED'.
    """
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": str(job.id),
        "status": job.status,
        "original_file": job.original_file_path,
        "duration": job.duration,
        "width": job.width,
        "height": job.height,
        "error": job.error_message,
        "prompt": job.prompt,
        "ai_reply": job.ai_reply
    }
# --- 3. DOWNLOAD VIDEO ---
@router.get("/{job_id}/download")
async def download_video(job_id: str, db: Session = Depends(get_db)):
    """
    Returns the video file stream.
    """
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.edited_file_path and Path(job.edited_file_path).exists():
        file_path = Path(job.edited_file_path)
        filename = f"edited_{job.id}.mp4"
    else:
        file_path = Path(job.original_file_path)
        filename = f"original_{job.id}.mp4"
    # --------------------

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")
    

  
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")

    # Return file stream
    return FileResponse(
        path=file_path, 
        filename=filename,
        media_type="video/mp4"
    )

# NOTE: The /jobs/prompt endpoint will be added here next week!