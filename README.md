

# 🎬 Editverse AI

**One Pixel at a Time.**
Editverse AI is a context-aware video editing tool that uses Artificial Intelligence to automatically apply filters, music, and speed adjustments based on the user's desired "vibe" (e.g., Romantic, Action, Horror).

## 🚀 Live Demo
**Frontend:** https://editverse-ai.vercel.app/
**Backend API:** https://editverse-backend.onrender.com

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS / Custom CSS
* **Deployment:** Vercel

### Backend
* **Framework:** FastAPI (Python)
* **Video Processing:** FFmpeg
* **AI Integration:** Custom logic for sentiment/context mapping
* **Task Management:** Synchronous processing (optimized for Render Free Tier)
* **Deployment:** Render

### Database
* **System:** PostgreSQL (Cloud)
* **ORM:** SQLAlchemy
* **Authentication:** JWT (JSON Web Tokens) with `passlib` (Bcrypt)

---

## ✨ Features
* **User Authentication:** Secure Sign Up and Login with JWT support.
* **Contextual Editing:**
    * **Action Mode:** Increases video speed (2x) and adds intense background music.
    * **Romantic Mode:** Applies warm color filters and soft, acoustic music.
* **Cloud Processing:** All video rendering happens on the server using FFmpeg.
* **Secure CORS:** Configured to allow secure communication between the Vercel Frontend and Render Backend.

---

## ⚙️ Installation & Local Setup

### Prerequisites
* Python 3.10+
* Node.js & npm
* PostgreSQL (Local or Cloud URL)
* FFmpeg installed on your system path

### 1. Backend Setup

# Clone the repository
git clone [https://github.com/Shreyas1627/editverse_AI.git](https://github.com/Shreyas1627/editverse_AI.git)
cd editverse_AI/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up Environment Variables (.env)
# Create a .env file in the backend folder with:
# DATABASE_URL=postgresql://user:password@localhost/dbname
# SECRET_KEY=your_secret_key
# ALGORITHM=HS256

# Run the Server
uvicorn app.main:app --reload
2. Frontend Setup
Bash

cd ../frontend

# Install dependencies
npm install

# Create .env file for Vite
# Create a .env file in the frontend root:
# VITE_API_URL=http://localhost:8000

# Run the Frontend
npm run dev
🚧 Challenges & Optimizations
CORS & Security: Implemented specific origin whitelisting to allow secure communication between Vercel and Render while blocking unauthorized access.

Memory Management: Optimized video processing tasks to run within the constraints of free-tier cloud instances (512MB RAM), utilizing synchronous blocking where necessary to prevent OOM kills.

Dependency Management: Pinned specific versions of bcrypt and passlib to ensure compatibility with modern Python environments.



📄 License
This project is licensed under the MIT License.
