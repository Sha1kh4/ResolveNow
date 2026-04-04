# ResolveNow Backend

The ResolveNow Backend is a FastAPI-based service designed to handle complaints and grievances. It features automated assignment of complaints to faculty members, status tracking, and notification systems.

## Design & Architecture

### Application Architecture
This diagram outlines the high-level components of the backend, request flow, and interactions with external services like MongoDB and Amazon S3.

```mermaid
graph TD
    Client[Client App / Browser] -->|HTTP / REST API| API[FastAPI Application]
    
    subgraph FastAPI Backend
        Routers[API Routers]
        
        subgraph Services
            AuthSvc[Auth Service]
            ComplaintSvc[Complaint Service]
            AdminSvc[Admin Service]
            AssignmentSvc[Assignment Service]
            NotificationSvc[Notification Service]
            S3Svc[S3 Storage Service]
        end
        
        Routers --> AuthSvc
        Routers --> ComplaintSvc
        Routers --> AdminSvc
        
        ComplaintSvc --> AssignmentSvc
        ComplaintSvc --> NotificationSvc
        ComplaintSvc --> S3Svc
        
        AdminSvc --> AssignmentSvc
    end
    
    subgraph Background Tasks
        Scheduler[Task Scheduler]
        EscalationWorker[Escalation Worker]
        
        Scheduler --> EscalationWorker
        EscalationWorker --> ComplaintSvc
        EscalationWorker --> NotificationSvc
    end
    
    API -->|Motor AsyncIO| MongoDB[(MongoDB)]
    EscalationWorker -->|Motor AsyncIO| MongoDB
    
    API -->|Boto3| S3[(Amazon S3)]
```

### Entity-Relationship (ER) Diagram
This diagram represents the logical relationships and references between the primary entities and collections in the MongoDB database.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        string password_hash
        enum role "USER, STUDENT, FACULTY, ADMIN"
        enum user_status "PENDING, ACTIVE"
        boolean is_active
        boolean is_email_verified
        datetime created_at
    }

    DEPARTMENT {
        ObjectId _id PK
        enum name "BEHAVIOURAL, INFRASTRUCTURAL, ACADEMIC, GENERAL"
        string description
        enum default_priority "LOW, MEDIUM, HIGH"
        ObjectId[] faculty_user_ids FK
    }

    COMPLAINT {
        ObjectId _id PK
        string title
        string description
        enum status "OPEN, IN_PROGRESS, RESOLVED, REJECTED"
        ObjectId student_id FK
        ObjectId department_id FK
        ObjectId assigned_faculty_id FK "nullable"
    }

    FACULTY_ASSIGNMENT {
        ObjectId _id PK
        ObjectId complaint_id FK
        ObjectId faculty_id FK
        ObjectId department_id FK
        datetime assigned_at
    }

    ATTACHMENT {
        ObjectId _id PK
        ObjectId complaint_id FK
        string file_name
        string file_url
        string content_type
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user_id FK
        string message
        boolean is_read
        datetime created_at
    }

    %% Relationships
    USER ||--o{ COMPLAINT : "creates (as student)"
    USER ||--o{ FACULTY_ASSIGNMENT : "receives (as faculty)"
    USER ||--o{ NOTIFICATION : "receives"
    
    DEPARTMENT ||--o{ USER : "has assigned faculty"
    DEPARTMENT ||--o{ COMPLAINT : "handles"
    
    COMPLAINT ||--o{ ATTACHMENT : "contains"
    COMPLAINT ||--o| FACULTY_ASSIGNMENT : "is assigned via"
```

## Setup & Installation

1.  **Clone the repository.**
2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure environment variables:** Create a `.env` file based on the provided configuration.
5.  **Run the application:**
    ```bash
    python -m app.main
    ```
