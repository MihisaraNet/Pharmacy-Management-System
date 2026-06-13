# 💊 MediCare — Pharmacy Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

A full-stack **Pharmacy Management System** built with **Spring Boot**, **React (Vite)**, and **MySQL**. Developed as a **Second Year, First Semester Academic Project**, MediCare provides a complete solution for modern pharmacy operations — including Role-Based Access Control (RBAC), medicine inventory management, batch expiry tracking, sales processing, delivery tracking, and automated reporting.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React SPA)                       │
│   React 18 + Vite + Tailwind CSS + Axios + React Router     │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS + JWT Bearer Token
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot)                        │
│                                                              │
│  ┌─────────────────┐   ┌──────────────────────────────┐     │
│  │ Spring Security │──▶│     REST Controllers          │     │
│  │  JWT Filter     │   │  (Auth, Users, Medicines,    │     │
│  └─────────────────┘   │   Sales, Delivery, Reports,  │     │
│                        │   Expiry, Notifications)      │     │
│                        └──────────────┬───────────────┘     │
│                                       │                      │
│                        ┌──────────────▼───────────────┐     │
│                        │       Service Layer           │     │
│                        └──────────────┬───────────────┘     │
│                                       │                      │
│                        ┌──────────────▼───────────────┐     │
│                        │  Spring Data JPA / Hibernate  │     │
│                        └──────────────┬───────────────┘     │
└───────────────────────────────────────┼─────────────────────┘
                                        │
                       ┌────────────────▼────────────────┐
                       │         MySQL 8.x Database        │
                       └──────────────────────────────────┘
```

---

## ✨ Features

### 👥 Admin Portal
- **User Management** — Create, edit, and delete Admin and Customer accounts
- **Medicine Management** — Add, update, and permanently delete medicines with cascade handling
- **Sales Management** — View all orders with advanced filtering by status, date, customer, and amount
- **Delivery Management** — Track and update delivery statuses for all orders
- **Expiry Tracking** — Monitor medicine batches with automated status classification
- **Report Generation** — One-click 30-day sales and low-stock inventory reports
- **Urgent Alert Center** — Real-time banners for critical low stock and expiry warnings

### 🛒 Customer Portal
- **Browse Medicines** — Search, filter by category, and sort the full medicine catalogue
- **Shopping Cart** — Add medicines, adjust quantities, and checkout
- **Order History** — View personal order status and history
- **Dark Mode** — Toggle between light and dark themes

### 📅 Batch & Expiry Analytics
- **Granular Batch Tracking** — Track batches by vendor, quantity, purchase value, manufacture date, and expiry date
- **Automated Status Classification:**

  | Status | Condition |
  |---|---|
  | `ACTIVE` | Expiry > 30 days away |
  | `EXPIRING_SOON` | Expiry within 30 days |
  | `NEAR_EXPIRY` | Expiry within 7 days |
  | `EXPIRED` | Past expiry date |
  | `DISPOSED` | Manually marked disposed |
  | `RECALLED` | Marked as recalled |

- **Financial Risk Assessment** — Shows total value-at-risk for expired/near-expiry batches
- **Bulk Disposal** — Dispose of multiple expired batches in a single action

### 📊 Reports
- **30-Day Sales Summary** — Revenue, order count, and top-selling medicines
- **Low Stock Report** — Instant list of medicines below threshold for timely restocking

### 🔐 Security
- **JWT Authentication** — Stateless sessions with short-lived JSON Web Tokens
- **Role-Based Access Control** — `ADMIN` and `CUSTOMER` roles with `@PreAuthorize` endpoint protection
- **BCrypt Password Hashing** — Industry-standard password encryption
- **Environment Variable Secrets** — No credentials hardcoded in source code

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework (SPA) |
| Vite | Build tool & dev server |
| Tailwind CSS + PostCSS | Styling & design system |
| React Router DOM v6 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| React Toastify | Toast notifications |
| Lucide React | Icon library |
| Context API | Auth, Cart & Theme state management |

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3.x | Application framework |
| Spring Security | Authentication & authorization |
| JWT (JSON Web Tokens) | Stateless auth tokens |
| Spring Data JPA | ORM & database abstraction |
| Hibernate | JPA implementation |
| MySQL 8.x | Relational database |
| Swagger UI / OpenAPI 3 | API documentation |
| Maven | Build & dependency management |

---

## 📁 Project Structure

```
pharmacy-app/
├── backend/
│   ├── src/main/java/com/example/pharmacy/
│   │   ├── config/         # CORS, Web, Security config
│   │   ├── controller/     # REST API endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── UserController.java
│   │   │   ├── MedicineController.java
│   │   │   ├── MedicineExpiryController.java
│   │   │   ├── SaleController.java
│   │   │   ├── DeliveryController.java
│   │   │   ├── ReportController.java
│   │   │   └── ExpiryNotificationController.java
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── entity/         # JPA entity models
│   │   ├── repository/     # Spring Data repositories
│   │   ├── security/       # JWT filter & security config
│   │   ├── service/        # Business logic layer
│   │   ├── strategy/       # Strategy pattern (reports)
│   │   └── util/           # JWT utility class
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── .env.example        # Environment variable template
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance & interceptors
│   │   ├── components/     # Reusable components
│   │   │   ├── NavBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SimpleExpiryDashboard.jsx
│   │   │   └── SimpleExpiryNotifications.jsx
│   │   ├── context/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── SimpleAdminPanel.jsx
│   │   ├── index.css       # Global styles & Tailwind
│   │   └── main.jsx        # App entry point & routing
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docker/
│   └── docker-compose.yml  # MySQL container setup
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Java Development Kit (JDK) 17+
- Node.js v18+ and npm
- MySQL Server 8.0+ **or** Docker Desktop

---

### Step 1: Start the Database

**Option A — Docker (Recommended)**
```bash
cd docker
docker-compose up -d
```
> Starts MySQL 8.0 on port `3306`. Database: `pharmacy`, Password: `root`

**Option B — Manual MySQL**
```sql
CREATE DATABASE phamarcy_db_1;
```

---

### Step 2: Configure & Run the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create your local environment file by copying the example:
```bash
copy .env.example .env
```

3. Fill in your `.env` file with your actual database credentials:
```properties
DB_URL=jdbc:mysql://localhost:3306/phamarcy_db_1
DB_USERNAME=root
DB_PASSWORD=your_password
SERVER_PORT=8082
```

4. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

5. Verify the backend is running:
   - **Base API:** `http://localhost:8082`
   - **Swagger Docs:** `http://localhost:8082/swagger-ui/index.html`

> [!NOTE]
> JPA will auto-create/update tables on first run (`ddl-auto=update`). Populate the database with sample data using `/backend/src/main/resources/sample-data.sql` if available.

---

### Step 3: Run the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Vite dev server:
```bash
npm run dev
```

4. Open the app in your browser:
   - **URL:** `http://localhost:5173`

---

## 🔑 Default Login Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| **ADMIN** | `admin` | `password` | Full system access |
| **CUSTOMER** | `alice` | `password` | Browse, cart & orders |

---

## 🛣️ API Endpoints

### 🔐 Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | PUBLIC | Login, returns JWT token |
| `POST` | `/api/auth/register` | PUBLIC | Register new customer |

### 👥 Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | ADMIN | List all users |
| `POST` | `/api/users` | ADMIN | Create new user |
| `PUT` | `/api/users/{id}` | ADMIN | Update user |
| `DELETE` | `/api/users/{id}` | ADMIN | Delete user |

### 💊 Medicines
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/medicines` | PUBLIC | List medicines (`?availableOnly=true`) |
| `POST` | `/api/medicines` | ADMIN | Add new medicine |
| `PUT` | `/api/medicines/{id}` | ADMIN | Update medicine |
| `DELETE` | `/api/medicines/{id}` | ADMIN | Delete medicine (hard delete) |

### 📅 Batch Expiry
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/medicine-expiry` | ADMIN | List all expiry batches |
| `POST` | `/api/medicine-expiry` | ADMIN | Register new batch |
| `GET` | `/api/medicine-expiry/dashboard` | ADMIN | Expiry KPIs & value at risk |
| `PUT` | `/api/medicine-expiry/bulk-status` | ADMIN | Bulk update batch status |
| `GET` | `/api/notifications/summary` | ADMIN | Alert counts by priority |

### 🛒 Sales & Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/sales` | CUSTOMER | Create order/checkout |
| `GET` | `/api/sales` | ADMIN | View all sales & orders |

### 🚚 Deliveries
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/deliveries` | ADMIN | List all deliveries |
| `PUT` | `/api/deliveries/{id}` | ADMIN | Update delivery status |

### 📊 Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports` | ADMIN | Generate 30-day sales & low-stock report |

---

## 👥 Project Contributors

Developed as a **Second Year, First Semester Academic Project** at SLIIT.

| Student ID | Contributor | Module |
|---|---|---|
| **IT24100878** | Imalki G.N. | Process Sales |
| **IT24200343** | Avekshika A.H.E. | Monitor Expiry |
| **IT24100765** | Perera S.A.L.N. | Track Delivery |
| **IT24100883** | Karanayaka K.K.I.M. | Generate Reports |
| **IT24100862** | Kavishka G.D.H. | Manage Users |
| **IT24100830** | Supeshala R.D.M. | Manage Stock |

---

## 🔒 Production Checklist

Before deploying to production, ensure the following:

- [ ] Set all environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) on the server
- [ ] Change the default JWT secret key in `JwtUtil.java`
- [ ] Switch `spring.jpa.hibernate.ddl-auto` from `update` to `validate`
- [ ] Disable SQL logging (`spring.jpa.show-sql=false`)
- [ ] Configure restrictive CORS origins in `WebConfig.java` (no wildcards)
- [ ] Enforce HTTPS / SSL for all traffic
- [ ] Resolve customer ID from server-side JWT context, not from client payload

---

> For bug reports or contributions, please open an issue in the repository.