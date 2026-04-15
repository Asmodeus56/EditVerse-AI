# backend/app/tasks.py
# from backend.app.core.celeryapp import celery_app
from backend.app.services.vidpro import get_video_metadata,apply_edits

from backend.app.db.database import SessionLocal 
from backend.app.db.models import VideoJob
from backend.app.services.promptparser import parse_prompt
import json
import os
import time


# @celery_app.task
def dummy_video_processing(job_id: str, filename: str):
    db = SessionLocal()

    
    """
    Real video processing task.
    """
    print(f"🎬 [WORKER] STARTED processing video: {filename} (Job: {job_id})")

    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
            print(f"❌ [WORKER] Job {job_id} not found in DB!")
            return "JOB_NOT_FOUND"

        # Update status to indicate work has started
    job.status = "PROCESSING"
    db.commit()
    
    # 1. Construct the full file path
    # We need to know where the file is. 
    # Since tasks.py is in backend/app/, we go up two levels to backend/
    # base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    # file_path = os.path.join(os.path.dirname(base_dir),"temp_storage",filename)
    file_path = job.original_file_path

    print(f"🔍 [WORKER] Looking for file at: {file_path}")

    try:
        # 2. Run FFmpeg Probe
        metadata = get_video_metadata(file_path)

        # 5. Update Job with Metadata
        # This saves the results so the frontend can see them later
        job.duration = metadata.get("duration")
        job.width = metadata.get("width")
        job.height = metadata.get("height")
        job.fps = metadata.get("fps")
        job.codec = metadata.get("codec")
        
        job.status = "COMPLETED" 
        db.commit() # Final save
        
        print(f"✅ [WORKER] SUCCESS! Metadata extracted: {metadata}")
        print(f"✅ [WORKER] SUCCESS! Metadata saved to DB.")
        return "DONE"
    
    except Exception as e:
        print(f"❌ [WORKER] FAILED: {str(e)}")
        return {"status": "FAILED", "error": str(e)}
    
# @celery_app.task
def process_video_edit(job_id: str, prompt: str):
    """
    Step 2 Task: Receives a prompt, parses it, and (eventually) runs FFmpeg.
    """
    db = SessionLocal()
    try:
        print(f"🤖 [WORKER] Received Prompt for Job {job_id}: '{prompt}'")
        
        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        if not job:
            return "JOB_NOT_FOUND"

        job.status = "EDITING"
        db.commit()

        # 1. Parse the Prompt
        parsed_result = parse_prompt(prompt)
        actions = parsed_result["actions"]
        reply = parsed_result.get("reply", "Done!")
        print(f"📜 [WORKER] Parsed Actions: {actions}")
        print(f"💬 [WORKER] Reply: {reply}")

        # 2. Save the AI Reply to DB
        job.ai_reply = reply

        if not actions:
            print("🛑 [WORKER] No actions detected. Treating as chat.")
            job.status = "CHAT_ONLY" # Mark done so frontend sees the reply
            # We DO NOT update job.edited_file_path, so the video stays same
            db.commit()
            return {"status": "CHAT_ONLY", "reply": reply}

        # 2. (Future) Execute FFmpeg based on 'actions'
        # For now, we pretend to edit by sleeping or just passing through
        original_path = job.original_file_path

        input_path = job.edited_file_path if job.edited_file_path else original_path
        print(f"🔗 [CHAINING] Using input file: {input_path}") # Optional: Debug print
        edited_path = apply_edits(input_path, actions)
        
        # 3. Update Status
        job.edited_file_path = edited_path
        job.status = "COMPLETED"
        db.commit()
        print(f"✅ [WORKER] Edit Complete! Saved to: {edited_path}")
        
        return {"status": "DONE", "actions_taken": actions}
        
        # (Optional) You could update the DB here with the duration, but printing is fine for now.
        # return metadata

    except Exception as e:
        print(f"❌ [WORKER] FAILED: {str(e)}")
        return {"status": "FAILED", "error": str(e)}