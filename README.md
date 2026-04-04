# ResolveNow

ResolveNow is a full-stack complaint management platform built with:

- `FastAPI` backend
- `MongoDB` database
- `React + Vite` frontend

It is designed to support complaint submission, department-based routing, faculty assignment, escalation handling, and resolution tracking.

## Complaint Management System - System Overview

The Complaint Management System is a web-based application developed using `FastAPI` as the backend framework, `MongoDB` as the database, and `React` as the frontend interface. The system is designed to streamline the process of submitting, managing, and resolving complaints within an organization or institution. It supports three primary roles: `Student`, `Faculty`, and `Admin`, each with specific responsibilities and permissions.

The system begins with a unified registration process where both students and faculty members register directly with their selected role. During registration, users provide their email credentials, after which an email verification process is triggered to ensure the authenticity of the account. Only after successful email verification is the account officially activated in the system according to its role workflow. The Admin then reviews the list of registered faculty members and has the authority to approve them and map them to specific complaint departments based on administrative decisions.

The system consists of four main complaint departments: `Infrastructural`, `Behavioural`, `Academic`, and `General`. When a user submits a complaint, they are required to provide essential details such as the complaint title and description. Additionally, the system allows users to attach supporting media files, including images and videos. These media files are securely stored using `Amazon S3` for scalable and reliable file management. During submission, the user selects the appropriate department from a dropdown menu, and the complaint is automatically routed to that department for processing.

Once a complaint is assigned to a department, it is distributed among the available faculty members within that department using a `Round Robin` assignment algorithm. This ensures fair workload distribution by sequentially assigning incoming complaints to different faculty members. The assigned faculty member is responsible for reviewing the complaint and providing an appropriate resolution within the defined time frame.

The system incorporates a `priority-based escalation` mechanism to ensure timely resolution of complaints. Each department has predefined deadlines for resolving complaints. For example, complaints categorized under the `Behavioural` and `Infrastructural` departments are initially assigned a `Medium priority` level and must be resolved within `four days`. If the complaint remains unresolved after `two days`, the system automatically escalates its priority status from Medium to `High`. Upon escalation, an automated email notification is sent to all administrators informing them that the complaint has been upgraded to high priority and requires immediate attention.

Similarly, once a faculty member provides a resolution for a complaint, the system automatically sends an email notification to the respective user. The notification includes the complaint ID, title, and confirmation that the issue has been resolved, prompting the user to log in and review the resolution details.

Overall, this system ensures efficient complaint handling through structured workflows, automated assignment, priority escalation, secure file storage, and real-time email notifications. It enhances transparency, accountability, and response time within the organization by maintaining clear communication between users, faculty members, and administrators.

## Current Stack

- Backend: FastAPI, Uvicorn, Pydantic, Motor/PyMongo, PyJWT
- Frontend: React, React Router, Axios, Vite
- Database: MongoDB Atlas or local MongoDB
- File storage: Amazon S3

## Project Structure

```text
ComplaintManagementSystem/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- config/
|   |   |-- models/
|   |   |-- repositories/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- utils/
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |-- public/
|   `-- package.json
|-- .env
`-- README.md
```

## Backend Collections

The backend currently works with these main MongoDB collections:

- `users`
  Roles are limited to `student`, `faculty`, and `admin`
- `departments`
  Stores department name, description, default priority, and mapped faculty IDs
- `complaints`
  Stores complaint details, department mapping, priority, deadline, and status
- `faculty_assignments`
  Stores complaint-to-faculty assignment records created through round robin routing
- `attachments`
  Stores uploaded attachment metadata
- `notifications`
  Stores notification records for complaint events

## Prerequisites

Make sure these are installed:

- Python 3.10+
- Node.js 18+
- npm
- MongoDB connection string

## Environment Setup

This project uses:

- root [`.env`](/d:/ComplaintManagementSystem/.env) for backend configuration
- [`frontend/.env`](/d:/ComplaintManagementSystem/frontend/.env) for frontend configuration

### Backend environment variables

Add or update these values in [`.env`](/d:/ComplaintManagementSystem/.env):

```env
APP_NAME=ResolveNow
APP_VERSION=1.0.0
APP_ENV=development
DEBUG=true
API_PREFIX=/api/v1
HOST=0.0.0.0
PORT=8000

FRONTEND_URL=http://localhost:5173
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173

MONGODB_URI=your-mongodb-uri
MONGODB_DB_NAME=complaint_management_db

JWT_SECRET_KEY=your-jwt-secret
REFRESH_TOKEN_SECRET_KEY=your-refresh-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

INITIAL_ADMIN_NAME=
INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=ResolveNow

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET_NAME=complaint-management-files
```

Note:

- `INITIAL_ADMIN_*` can be left blank.

### Frontend environment variables

Set this in [`frontend/.env`](/d:/ComplaintManagementSystem/frontend/.env):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## How To Run The Project

### Run the backend

Open a terminal in `backend`:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

Health endpoints:

- `GET /`
- `GET /health`

### Run the frontend

Open another terminal in `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Available Frontend Scripts

From [`frontend/package.json`](/d:/ComplaintManagementSystem/frontend/package.json):

```powershell
npm run dev
npm run build
npm run preview
```

## Backend Entry Point

The backend application starts from [`backend/app/main.py`](/d:/ComplaintManagementSystem/backend/app/main.py).

Currently included:

- authentication routes
- admin routes
- health endpoints

## Complaint Ticket ID

Complaints now support a human-readable ticket ID such as:

```text
#CMP-20260403-AB7AE7
```

This is defined in [`backend/app/models/complaint_model.py`](/d:/ComplaintManagementSystem/backend/app/models/complaint_model.py).

## Notes

- Do not commit real secrets from `.env`.
- If PowerShell blocks venv activation, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

- If MongoDB is unreachable, backend startup will fail during database connection.

## Future Improvements

- complete complaint CRUD APIs
- connect round robin assignment into complaint creation flow
- add complaint, faculty assignment, and escalation tests
- expand admin controls for department and faculty mapping
