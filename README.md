# College Event Management System (EMS)

A production-grade system for managing internal college events.

## Features
- **Student Identity**: Register Number based tracking (CSE, ECE, IT, etc.)
- **Smart Registration**: Automated eligibility checks and capacity management.
- **Admin Dashboard**: Live analytics and event control.
- **Premium UI**: Modern glassmorphism design with responsive layouts.

## Tech Stack
- **Backend**: FastAPI, MongoDB (Motor), JWT Auth
- **Frontend**: Next.js, Vanilla CSS, Framer Motion, Lucide Icons

## Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Cluster (local or cloud)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure Environment
Update `.env` with your MongoDB URI.

#### Initialize Database
```bash
python init_db.py
```

#### Run Backend
```bash
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

#### Run Frontend
```bash
npm run dev
```

## Default Credentials
- **Admin**: admin@college.edu
- **Password**: admin123
