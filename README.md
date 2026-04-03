# ZeroSavings.com — Finance Dashboard

A full-stack finance dashboard for tracking income, expenses, and financial insights with role-based access control.

Built with **Spring Boot** (backend) and **React + Vite** (frontend).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Demo Accounts](#demo-accounts)
5. [API Reference](#api-reference)
6. [Access Control](#access-control)
7. [Data Model](#data-model)
8. [Assumptions & Design Decisions](#assumptions--design-decisions)
9. [Tradeoffs Considered](#tradeoffs-considered)
10. [H2 Console](#h2-console-dev)

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Backend   | Java 25 (compiled to Java 21), Spring Boot 3.4.1   |
| Security  | Spring Security + JWT (jjwt 0.11.5)                |
| Database  | H2 in-memory (auto-seeded on startup)              |
| Frontend  | React 18, React Router 6, Vite 5                   |
| UI        | Tailwind CSS v4, Framer Motion, Recharts           |
| Build     | Maven 3.9.6 (backend), npm (frontend)              |

---

## Quick Start

### Prerequisites

- Java 17+ (project uses JDK 25)
- Maven 3.8+ — download at `https://maven.apache.org/download.cgi`
- Node.js 18+

### 1. Start Backend

```powershell
cd backend

# PowerShell (recommended — handles spaces in JAVA_HOME path correctly)
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-25'
D:\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

Backend starts on **http://localhost:8080**

> If port 8080 is already in use, find and kill the process:
> ```powershell
> netstat -aon | findstr :8080
> taskkill /F /PID <pid>
> ```

### 2. Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts on **http://localhost:3000**

### One-Command Start (Windows)

```bat
start.bat
```

This script kills any existing process on port 8080, starts the backend in a new PowerShell window, waits 15 seconds, then starts the frontend.

---

## Project Structure

```
ZeroSavings/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/finance/dashboard/
│       │   ├── config/
│       │   │   ├── SecurityConfig.java       # JWT + CORS + role-based URL rules
│       │   │   ├── GlobalExceptionHandler.java # Centralised error responses
│       │   │   └── DataSeeder.java           # Auto-seeds demo data on startup
│       │   ├── controller/
│       │   │   ├── AuthController.java       # POST /api/auth/login, /register
│       │   │   ├── FinancialRecordController.java
│       │   │   ├── DashboardController.java
│       │   │   └── UserController.java
│       │   ├── dto/
│       │   │   └── Dto.java                  # All request/response DTOs in one file
│       │   ├── entity/
│       │   │   ├── User.java                 # username, email, role, status
│       │   │   └── FinancialRecord.java      # amount, type, category, date, notes, deleted
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   └── FinancialRecordRepository.java  # Custom JPQL for filters + aggregations
│       │   ├── security/
│       │   │   ├── JwtUtil.java              # Token generation + validation
│       │   │   └── JwtFilter.java            # Per-request JWT extraction
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── UserService.java
│       │       └── FinancialRecordService.java  # CRUD + dashboard aggregation logic
│       └── resources/
│           └── application.properties
│
└── frontend/
    ├── index.html
    ├── vite.config.js                        # Proxy /api → localhost:8080
    └── src/
        ├── api/index.js                      # Axios client with JWT interceptor
        ├── context/AuthContext.jsx           # Global auth state + role helpers
        ├── components/
        │   ├── Layout.jsx                    # Top navbar, mobile menu
        │   └── ProtectedRoute.jsx            # Auth + role guard
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx                 # Summary cards, charts, AI insight
            ├── Records.jsx                   # CRUD table with filters + pagination
            ├── Analytics.jsx                 # Deep-dive charts and metrics
            └── Users.jsx                     # Admin-only user management
```

---

## Demo Accounts

| Username | Password    | Role    | Access                                      |
|----------|-------------|---------|---------------------------------------------|
| admin    | admin123    | ADMIN   | Full access — records + users + dashboard   |
| analyst  | analyst123  | ANALYST | Read + write records, view dashboard        |
| viewer   | viewer123   | VIEWER  | Read-only — records + dashboard             |

> Data is seeded automatically on every backend startup. It reflects a realistic Indian household (Bengaluru) with 6 months of transactions including salary, rent, EMIs, SIPs, festival spending, and travel.

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint            | Auth | Description              |
|--------|---------------------|------|--------------------------|
| POST   | `/api/auth/login`   | No   | Returns JWT token        |
| POST   | `/api/auth/register`| No   | Registers new user, returns JWT |

**Login request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "username": "admin",
  "role": "ADMIN"
}
```

---

### Financial Records

| Method | Endpoint              | Auth | Role           | Description                        |
|--------|-----------------------|------|----------------|------------------------------------|
| GET    | `/api/records`        | Yes  | All            | Paginated + filtered list          |
| GET    | `/api/records/{id}`   | Yes  | All            | Single record                      |
| POST   | `/api/records`        | Yes  | ANALYST, ADMIN | Create record                      |
| PUT    | `/api/records/{id}`   | Yes  | ANALYST, ADMIN | Update record                      |
| DELETE | `/api/records/{id}`   | Yes  | ANALYST, ADMIN | Soft delete (sets deleted = true)  |

**Query parameters for GET `/api/records`:**

| Param      | Type   | Example        | Description              |
|------------|--------|----------------|--------------------------|
| `type`     | String | `INCOME`       | Filter by INCOME/EXPENSE |
| `category` | String | `Rent`         | Partial match            |
| `from`     | Date   | `2026-01-01`   | Start date (ISO)         |
| `to`       | Date   | `2026-04-30`   | End date (ISO)           |
| `page`     | int    | `0`            | Page number (0-based)    |
| `size`     | int    | `10`           | Page size (default 10)   |

**Record request body:**
```json
{
  "amount": 72000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
```

---

### Dashboard

| Method | Endpoint                 | Auth | Role | Description                          |
|--------|--------------------------|------|------|--------------------------------------|
| GET    | `/api/dashboard/summary` | Yes  | All  | Totals, trends, categories, recent activity |

**Response includes:**
```json
{
  "totalIncome": 110500,
  "totalExpenses": 87648,
  "netBalance": 22852,
  "incomeByCategory": { "Salary": 72000, "Freelance": 15000, "Rental Income": 8500 },
  "expenseByCategory": { "Home Loan EMI": 14500, "Rent": 18000, "Groceries": 4800 },
  "monthlyTrends": [
    { "year": 2026, "month": 3, "income": 80500, "expenses": 52149 }
  ],
  "recentActivity": [ ... ]
}
```

---

### Users (Admin only)

| Method | Endpoint          | Auth | Role  | Description              |
|--------|-------------------|------|-------|--------------------------|
| GET    | `/api/users`      | Yes  | ADMIN | List all users           |
| GET    | `/api/users/{id}` | Yes  | ADMIN | Get single user          |
| POST   | `/api/users`      | Yes  | ADMIN | Create user              |
| PUT    | `/api/users/{id}` | Yes  | ADMIN | Update role/status/email |
| DELETE | `/api/users/{id}` | Yes  | ADMIN | Delete user              |

**Update user request:**
```json
{
  "role": "ANALYST",
  "status": "INACTIVE"
}
```

---

## Access Control

Access is enforced at two levels:

**1. URL-level — Spring Security (`SecurityConfig.java`)**
```
Public:         POST /api/auth/**
All roles:      GET  /api/records/**, GET /api/dashboard/**
ANALYST+ADMIN:  POST/PUT/DELETE /api/records/**
ADMIN only:     /api/users/**
```

**2. Frontend — `ProtectedRoute.jsx` + `AuthContext.jsx`**
- Unauthenticated users are redirected to `/login`
- VIEWER and ANALYST cannot see the Users page in the navbar
- Write buttons (Add, Edit, Delete) are hidden for VIEWER role

---

## Data Model

### User
| Field    | Type   | Notes                          |
|----------|--------|--------------------------------|
| id       | Long   | Auto-generated                 |
| username | String | Unique                         |
| password | String | BCrypt hashed                  |
| email    | String | Unique                         |
| role     | Enum   | VIEWER, ANALYST, ADMIN         |
| status   | Enum   | ACTIVE, INACTIVE               |

### FinancialRecord
| Field     | Type       | Notes                              |
|-----------|------------|------------------------------------|
| id        | Long       | Auto-generated                     |
| amount    | BigDecimal | Positive value                     |
| type      | Enum       | INCOME, EXPENSE                    |
| category  | String     | e.g. Salary, Rent, Groceries       |
| date      | LocalDate  | Transaction date                   |
| notes     | String     | Optional description               |
| deleted   | boolean    | Soft delete flag (default false)   |
| createdBy | User (FK)  | User who created the record        |

---

## Assumptions & Design Decisions

- **H2 in-memory database** — Chosen for zero-setup simplicity. Data resets on every restart. To switch to PostgreSQL, update `application.properties` with the JDBC URL and add the PostgreSQL driver dependency to `pom.xml`.

- **Soft delete** — Records are flagged `deleted = true` instead of being physically removed. This preserves audit history and allows potential recovery. All queries filter `WHERE deleted = false`.

- **JWT stateless auth** — No server-side session storage. Tokens expire in 24 hours. The frontend stores the token in `localStorage` and attaches it via an Axios request interceptor.

- **ANALYST write access** — Analysts can create, update, and delete financial records but cannot manage users. This reflects a common finance team pattern where analysts handle data entry but not user administration.

- **Single Dto.java file** — All DTOs are grouped in one file as static inner classes. This keeps the package clean for a project of this size and avoids creating many small files.

- **DataSeeder** — 60+ realistic Indian household transactions across 6 months are auto-created on startup (Bengaluru family: salary, rent, EMIs, SIPs, festival spending). This gives the dashboard meaningful charts immediately without manual data entry.

- **Pagination default** — Page size defaults to 10, configurable via `?size=` query param.

- **Currency** — All amounts are stored as `BigDecimal` for precision. The frontend displays values in Indian Rupees (₹) with `en-IN` locale formatting (e.g. ₹1,00,000).

- **CORS** — Configured to allow only `http://localhost:3000`. Update `application.properties` for production deployment.

---

## Tradeoffs Considered

| Decision | Chosen | Alternative | Reason |
|---|---|---|---|
| Database | H2 in-memory | PostgreSQL / MySQL | Zero setup for evaluation; swap is one config change |
| Auth | JWT stateless | Session-based | Stateless scales better; simpler for a REST API |
| Delete strategy | Soft delete | Hard delete | Preserves audit trail; common in finance systems |
| DTO structure | Single Dto.java | One file per DTO | Reduces file count for a small project; easy to split later |
| Frontend state | React Context | Redux / Zustand | Sufficient for this scope; avoids unnecessary complexity |
| Build tool | Vite | Create React App | CRA is deprecated and incompatible with Node 24; Vite is faster |
| Aggregation | JPQL in repository | Service-layer calculation | Database-level aggregation is more efficient for large datasets |
| Role enforcement | URL-level + frontend | URL-level only | Defense in depth; frontend hides irrelevant UI for better UX |

---

## H2 Console (Dev)

Access the database browser at **http://localhost:8080/h2-console**

| Field    | Value                    |
|----------|--------------------------|
| JDBC URL | `jdbc:h2:mem:financedb`  |
| Username | `sa`                     |
| Password | *(leave empty)*          |
<<<<<<< HEAD

---

## License

© 2026 Abdul Sami. All rights reserved.
=======

