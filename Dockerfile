# Use Python 3.10
FROM python:3.10-slim

# 1. Install System Dependencies (FFmpeg is crucial here)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libffi-dev \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*   
    

# 2. Set Working Directory
WORKDIR /app

# 3. Copy Requirements and Install
COPY backend/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the Application Code
COPY backend /app/backend

# 5. Create Temp Storage Directory (Required for your video uploads)
RUN mkdir -p /app/backend/temp_storage

# 6. Expose Port
EXPOSE 8000

# 7. Start Command (Run FastAPI)
# Note: For a simple demo, we will run only FastAPI. 
# For full production, you need a separate Celery worker.
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]