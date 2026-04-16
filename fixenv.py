# fix_env.py
import os

# Define the path to backend/.env
env_path = os.path.join("backend", ".env")

# The correct content
content = """DATABASE_URL="postgresql://app_user:strongpass@localhost:5432/Editversedb"
SECRET_KEY="super_secret_key_change_this"
PROJECT_NAME="EditVerse AI"
REDIS_HOST="localhost"
REDIS_PORT=6379
"""

# Write the file
with open(env_path, "w") as f:
    f.write(content)

print(f"✅ Successfully wrote fresh configuration to: {os.path.abspath(env_path)}")