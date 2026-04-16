# backend/app/core/celery_app.py

# from celery import Celery
# from backend.app.core.config import settings

# 1. Initialize Celery
# We name it "editverse_worker"
# celery_app = Celery(
#     "editverse_worker",
#     broker=settings.CELERY_BROKER_URL,
#     backend=settings.CELERY_RESULT_BACKEND
# )

# 2. Configure Settings
# celery_app.conf.update(
#     task_serializer="json",
#     accept_content=["json"],
#     result_serializer="json",
#     timezone="UTC",
#     enable_utc=True,
# )

# 3. Auto-discover tasks
# This tells Celery to look for a "tasks.py" file in these packages
# We will create 'backend.app.tasks' in the next step.
# celery_app.autodiscover_tasks(["backend.app"])