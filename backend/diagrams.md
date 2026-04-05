Here are all the Mermaid diagrams — paste any into [mermaid.live](https://mermaid.live) to render.

---

**1. System Architecture**

```mermaid
graph TD
  Browser["Browser (React SPA)"]
  Vite["Vite Dev Server :5173"]
  FastAPI["FastAPI :8000"]
  MongoDB[(MongoDB)]
  S3[(AWS S3)]
  Email["Email (Gmail SMTP)"]

  Browser -->|HTTP / Axios| Vite
  Vite -->|proxies API calls| FastAPI
  FastAPI -->|Motor async| MongoDB
  FastAPI -->|boto3| S3
  FastAPI -->|SMTP| Email

  subgraph Frontend
    Vite
    Browser
  end

  subgraph Backend
    FastAPI
  end
```

---

**2. Database ER Diagram**

```mermaid
erDiagram
  users {
    ObjectId _id PK
    string name
    string email
    string password_hash
    string role
    string user_status
    bool is_email_verified
    object email_verification
    array refresh_tokens
  }
  departments {
    ObjectId _id PK
    string name
    string description
    string default_priority
    array faculty_user_ids
  }
  complaints {
    ObjectId _id PK
    string complaint_id
    string title
    string description
    ObjectId created_by FK
    ObjectId department_id FK
    string status
    string priority
    datetime deadline
    datetime resolved_at
  }
  faculty_assignments {
    ObjectId _id PK
    ObjectId complaint_id FK
    ObjectId faculty_id FK
    ObjectId department_id FK
    datetime assigned_at
  }
  attachments {
    ObjectId _id PK
    ObjectId complaint_id FK
    ObjectId uploaded_by FK
    string file_url
    string file_type
  }
  notifications {
    ObjectId _id PK
    ObjectId user_id FK
    ObjectId complaint_id FK
    string type
    string message
    bool is_read
  }

  users ||--o{ complaints : creates
  departments ||--o{ complaints : categorizes
  users ||--o{ faculty_assignments : assigned_to
  complaints ||--o{ faculty_assignments : has
  complaints ||--o{ attachments : has
  users ||--o{ notifications : receives
```

---

**3. Registration & Login Sequence**

```mermaid
sequenceDiagram
  participant U as User
  participant FE as React Frontend
  participant BE as FastAPI
  participant DB as MongoDB
  participant EM as SMTP Email

  U->>FE: Fill registration form
  FE->>BE: POST /auth/register
  BE->>DB: Insert user (status=pending_email_verification)
  BE->>EM: Send verification email with token
  BE-->>FE: 201 RegisterResponse
  FE-->>U: Show success message

  U->>EM: Click verification link
  FE->>BE: POST /auth/verify-email {token}
  BE->>DB: Mark is_email_verified=true
  Note over BE,DB: Student → ACTIVE, Faculty → pending_approval
  BE-->>FE: VerifyEmailResponse
  FE-->>U: Show result

  U->>FE: Submit login form
  FE->>BE: POST /auth/login
  BE->>DB: Find user, verify password hash
  BE-->>FE: access_token + refresh_token + user
  FE->>FE: Store tokens in localStorage
  FE-->>U: Redirect to dashboard

  Note over FE,BE: Later — access token expires
  FE->>BE: POST /auth/refresh {refresh_token}
  BE->>DB: Validate + rotate refresh token
  BE-->>FE: New token pair
  FE->>FE: Update localStorage
```

---

**4. Complaint Creation Sequence**

```mermaid
sequenceDiagram
  participant S as Student
  participant FE as React
  participant BE as FastAPI
  participant DB as MongoDB
  participant S3 as AWS S3

  S->>FE: Fill complaint form + optional file
  FE->>BE: POST /complaints/create (multipart)
  BE->>BE: Decode JWT, identify user
  BE->>DB: Find department, check faculty_user_ids
  alt No faculty assigned
    BE-->>FE: HTTP 400 No faculty available
  else Faculty exists
    alt File attached and S3 configured
      BE->>S3: upload_fileobj(file, filename)
      S3-->>BE: image URL
    end
    BE->>DB: Insert complaint (status=OPEN, deadline=now+4d)
    BE->>DB: Query latest faculty_assignment for dept
    BE->>DB: Insert new faculty_assignment (round robin)
    BE->>DB: Update complaint status = ASSIGNED
    BE-->>FE: Complaint + assignment info
    FE-->>S: Redirect to /my-complaints
  end
```

---

**5. Complaint Status State Machine**

```mermaid
stateDiagram-v2
  [*] --> OPEN : Student creates complaint
  OPEN --> ASSIGNED : Round-robin assigns faculty
  ASSIGNED --> IN_PROGRESS : Faculty starts work
  IN_PROGRESS --> RESOLVED : Faculty resolves
  RESOLVED --> CLOSED : Admin/system closes
  OPEN --> CLOSED : Admin closes directly
  IN_PROGRESS --> ESCALATED : Deadline exceeded
  ESCALATED --> IN_PROGRESS : Re-assigned to new faculty
```

---

**6. Round Robin Assignment Flowchart**

```mermaid
flowchart TD
  A[New Complaint Created] --> B{Department has faculty?}
  B -- No --> ERR[HTTP 400: No faculty available]
  B -- Yes --> C[Query latest faculty_assignment for dept]
  C --> D{Prior assignment exists?}
  D -- No --> E[Pick faculty_user_ids at index 0]
  D -- Yes --> F{Last assigned faculty still in dept?}
  F -- No --> E
  F -- Yes --> G["next_index = (last_index + 1) % len(faculty)"]
  G --> H[Pick faculty at next_index]
  E --> I[Insert faculty_assignments record]
  H --> I
  I --> J[Update complaint status = ASSIGNED]
  J --> K[Return assignment result]
```

---

**7. Admin Faculty Approval Flow**

```mermaid
sequenceDiagram
  participant A as Admin
  participant FE as React
  participant BE as FastAPI
  participant DB as MongoDB

  A->>FE: Open /admin/faculty-assignment
  FE->>BE: GET /admins/users (pending_approval)
  FE->>BE: GET /admins/departments
  BE-->>FE: Paginated users + departments
  FE-->>A: Faculty cards with dept dropdowns

  A->>FE: Select department, click Approve
  FE->>BE: POST /admins/faculty-assignments
  BE->>DB: user.user_status = ACTIVE
  BE->>DB: Remove user from all dept.faculty_user_ids
  BE->>DB: Add user to target dept.faculty_user_ids
  BE-->>FE: FacultyAssignmentResponse
  FE-->>A: Success, refresh list
```

---

**8. JWT Token Refresh Interceptor**

```mermaid
sequenceDiagram
  participant FE as Axios Interceptor
  participant BE as FastAPI

  FE->>BE: Any authenticated request
  BE-->>FE: HTTP 401 (token expired)
  FE->>BE: POST /auth/refresh {refresh_token}
  alt Valid refresh token
    BE->>BE: Revoke old, issue new token pair
    BE-->>FE: New access_token + refresh_token
    FE->>FE: Update localStorage
    FE->>BE: Retry original request
    BE-->>FE: Success response
  else Invalid / expired
    BE-->>FE: HTTP 401
    FE->>FE: Clear localStorage → force re-login
  end
```

---

**9. User Role & Status Lifecycle**

```mermaid
flowchart TD
  REG[User Registers] --> PEV[status: pending_email_verification]
  PEV --> VER{Clicks verification link}
  VER -- Student --> ACT[status: ACTIVE\nCan log in immediately]
  VER -- Faculty --> PA[status: pending_approval\nBlocked from login]
  PA --> ADM{Admin assigns department}
  ADM --> FACT[status: ACTIVE\nCan log in + receive assignments]

  ACT --> LOGIN[Login → gets JWT tokens]
  FACT --> LOGIN
```

---

**10. Full Backend Layer Diagram**

```mermaid
graph TD
  subgraph Routes
    AR[auth_routes]
    ADR[admin_routes]
    CR[complaint_routes]
  end

  subgraph Services
    AS[AuthService]
    ADS[AdminService]
    CS[ComplaintService]
    ASS[AssignmentService]
  end

  subgraph Repositories
    UR[UserRepository]
    DR[DepartmentRepository]
    CPR[ComplaintRepository]
    FAR[FacultyAssignmentRepository]
  end

  AR --> AS
  ADR --> ADS
  CR --> CS
  CS --> ASS

  AS --> UR
  ADS --> UR
  ADS --> DR
  ADS --> CPR
  CS --> CPR
  CS --> DR
  ASS --> DR
  ASS --> FAR
  ASS --> CPR

  UR --> MongoDB[(MongoDB)]
  DR --> MongoDB
  CPR --> MongoDB
  FAR --> MongoDB
```