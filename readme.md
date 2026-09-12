# ⚡ Load Shedding & Power Outage Management System

A robust, role-based REST API designed for utility providers to seamlessly coordinate power distribution, manage load-shedding schedules, track unexpected outages, dispatch technicians, and handle online electricity bill payments.

---

## 🏗️ System Flow

```text
Power Authority / Admin
         │
         ▼
Distribution Zone
         │
         ▼
     Substation
         │
         ▼
      Feeder
         │
         ▼
       Area
         ├───────────────────────┐
         ▼                       ▼
  Scheduled Outage      Unexpected Outage
         │                       │
         ▼                       ▼
    Notification         Customer Report
                                 │
                                 ▼
                        Technician Assigned
                                 │
                                 ▼
                              Repair
                                 │
                                 ▼
                             Restored

```

---

## 👥 User Roles & Permissions

| Role | 🛠️ Key Capabilities |
| --- | --- |
| **👑 Admin** | Manage distribution zones, substations, feeders, and areas; create load-shedding schedules; monitor outages; manage users and technician assignments; view analytics. |
| **🔧 Technician** | View assigned outage tasks, accept/reject assignments, start repair work, update assignment status, add repair notes, and mark jobs as completed. |
| **👤 Customer** | Secure registration and login, manage profile, view load-shedding schedules, report unexpected outages, track restoration status, view bills, and pay via SSLCommerz. |

---

## ✨ Core Features

* **🔐 Security & Auth:** JWT authentication (access & refresh tokens), role-based authorization, secure password hashing (`bcrypt`), and Zod request validation.
* **⚡ Grid Infrastructure:** Full hierarchy management for distribution zones, substations, feeders, and service areas.
* **📅 Outage Management:** Load-shedding schedule management, planned/unexpected outage tracking, and customer reporting.
* **🛠️ Field Operations:** Technician assignment dispatching, repair tracking, and restoration-status updates.
* **💳 Billing & Payments:** Utility bill management, SSLCommerz online payment integration, secure webhook validation, and duplicate-payment protection.
* **🛡️ Reliability:** Centralized error handling, Prisma error handling, soft deletion support, Biome code linting, and Swagger/OpenAPI documentation.

---

## 🚀 Tech Stack

| Category | Technology |
| --- | --- |
| **Runtime** | Node.js (v20+) |
| **Language** | TypeScript |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Validation** | Zod |
| **Payments** | SSLCommerz |
| **Documentation** | Swagger / OpenAPI |
| **Code Quality** | Biome |

---

## 🌐 API Endpoints Overview

* **Base URL:** `http://localhost:5000/api/v1`
* **API Documentation (Swagger):** `https://loadshedding-backend.vercel.app/api-docs`

| Module | Base Route | Purpose |
| --- | --- | --- |
| **Authentication** | `/auth` | Registration, login, token refresh, logout, profile |
| **Distribution Zones** | `/distribution-zones` | Manage electricity distribution zones |
| **Substations** | `/substations` | Manage substations within zones |
| **Feeders** | `/feeders` | Manage feeders connected to substations |
| **Areas** | `/areas` | Manage customer service areas |
| **Schedules** | `/schedules` | Manage load-shedding schedules |
| **Unexpected Outages** | `/outages` | Report and track unplanned outages |
| **Assignments** | `/assignments` | Assign technicians and track repair work |
| **Payments** | `/payments` | Initiate and verify SSLCommerz payments |
| **Admin** | `/admin` | Administrative system operations |

---

## 💳 Payment Integration (SSLCommerz)

### Payment Flow

1. The system or an Admin creates a bill for a Customer.
2. The Customer sends the bill ID to the payment-initiation endpoint.
3. The API creates a unique transaction ID and returns an SSLCommerz hosted payment URL.
4. The Customer completes the payment on SSLCommerz.
5. SSLCommerz triggers the backend webhook (`/api/v1/payments/webhook`).
6. The backend validates the payment securely; upon success, the bill status updates to `PAID`.

### Example: Initiate Payment

* **POST** `/api/v1/payments/initiate`
* **Access:** Customer (`Authorization: Bearer <access_token>`)
* **Request Body:**
```json
{
  "billId": "355d8890-d03d-4081-8ce0-1651b4ce8261"
}

```


* **Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "billId": "355d8890-d03d-4081-8ce0-1651b4ce8261",
    "billNumber": "ELEC-2026-008",
    "amount": 2100,
    "transactionId": "BILL-1789236535650-e8b6097b",
    "paymentUrl": "https://sandbox.sslcommerz.com/..."
  }
}

```



---

## 📁 Project Structure

```text
loadshedding-backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seedBills.ts
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   └── utils/
│   ├── generated/
│   └── app.ts
├── .env
├── biome.json
├── package.json
├── prisma.config.ts
└── tsconfig.json

```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v20 or later)
* PostgreSQL
* Git
* SSLCommerz Sandbox Account

### Installation Steps

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd loadshedding-backend

```


2. **Install dependencies**
```bash
npm install

```


3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_TOKEN_COOKIE_DAYS=7

SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

```


4. **Generate the Prisma Client & Migrate Database**
```bash
npx prisma generate
npx prisma migrate dev

```


5. **Seed sample bills (Optional)**
```bash
npx --yes tsx prisma/seedBills.ts

```


6. **Start the development server**
```bash
npm run dev

```



---

## 🛠️ Common Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with hot-reloading |
| `npm run build` | Compile TypeScript project |
| `npm start` | Run the compiled production application |
| `npx prisma migrate dev` | Apply database migrations |
| `npx prisma studio` | Open Prisma Database GUI |
| `npx biome check .` | Run Biome linter and formatter check |
| `npx biome check --write .` | Apply safe auto-fixes for lint and format issues |

---

## 🚀 Future Roadmap

* 🤖 Automated load-shedding schedule generation & conflict detection
* 📱 Push, SMS, and Email notifications
* ⚡ Real-time outage updates via WebSockets
* 🗺️ GIS-based infrastructure & outage map visualization
* 📊 Advanced analytics, audit logging, and downloadable reports