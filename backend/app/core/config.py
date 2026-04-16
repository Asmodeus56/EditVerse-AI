# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
from pathlib import Path
import os

# --- DEBUGGING PATH ---
# 1. Navigate to Project Root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
env_path = PROJECT_ROOT / '.env'

# Only log path info, never log file contents
print(f"DEBUG: Looking for .env file at: {env_path}")
print(f"DEBUG: Does the file exist? {env_path.exists()}")

# 2. Load the .env file explicitly
load_dotenv(dotenv_path=env_path) 

# ----------------------------------------

# ----------------------

class Settings(BaseSettings):
    # Core settings
    PROJECT_NAME: str = "EditVerse AI"
    # We use Field(..., env='DATABASE_URL') to be explicit, but default works too
    DATABASE_URL: str ="postgresql://app_user:strongpass@localhost:5432/Editversedb"
    SECRET_KEY: str = "default_insecure_key_if_missing"
    
    # Celery settings
    # REDIS_HOST: str = "localhost"
    # REDIS_PORT: int = 6379
    
    SAMBANOVA_API_KEY: str = ""
    # The URL for SambaNova's API
    SAMBANOVA_BASE_URL: str = "https://api.sambanova.ai/v1" 
    # We will use the fast Llama 3.1 8B model
    SAMBANOVA_MODEL: str = "Meta-Llama-3.3-70B-Instruct"

    # @property
    # def CELERY_BROKER_URL(self) -> str:
    #     return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # @property
    # def CELERY_RESULT_BACKEND(self) -> str:
    #     return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # This tells Pydantic to also look for the file here
    model_config = SettingsConfigDict(env_file=str(env_path), env_file_encoding='utf-8')

# Create instance
settings = Settings()