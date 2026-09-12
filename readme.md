Load Shedding & Power Outage Management System
A role-based REST API for managing electricity distribution infrastructure, load-shedding schedules, unexpected outages, customer reports, technician assignments, restoration progress, utility bills, and online payments.

This backend is designed for utility providers that need a structured way to coordinate power distribution and outage response across distribution zones, substations, feeders, and service areas.

System Flow
Power Authority/Admin
      |
      v
Distribution Zone
      |
      v
Substation
      |
      v
Feeder
      |
      v
Area
      |
      +-------------------+
      |                   |
      v                   v
Scheduled Outage     Unexpected Outage
      |                   |
      v                   v
Notification         Customer Report
                          |
                          v
                  Technician Assigned
                          |
                          v
                        Repair
                          |
                          v
                       Restored
User Roles
Admin
Manage distribution zones, substations, feeders, and areas

Create and manage load-shedding schedules

Monitor planned and unexpected outages

Manage customers, technicians, and other users

Assign technicians to outage incidents

Monitor restoration progress

Access system analytics and outage history

Technician
View assigned outage tasks

Accept or reject assignments

Start repair work

Update assignment and outage status

Add repair notes

Mark repair work as completed

Customer
Register and log in securely

Manage personal profile

View load-shedding schedules

Report unexpected outages

Track outage and restoration status

View utility bills

Pay unpaid bills through SSLCommerz

Core Features
JWT authentication with access and refresh tokens

Role-based authorization for Admin, Technician, and Customer

Secure password hashing

Customer profile management

Distribution-zone management

Substation management

Feeder management

Area management

Load-shedding schedule management

Planned and unexpected outage tracking

Customer outage reporting

Technician assignment and repair tracking

Restoration-status management

Utility bill management

SSLCommerz online bill payment

Payment callback and server-side validation

Duplicate-payment protection

Soft deletion for supported resources

Zod request validation

Centralized error handling

Prisma error handling

Swagger/OpenAPI documentation

Biome linting and formatting

Tech Stack
Category	Technology
Runtime	Node.js
Language	TypeScript
Framework	Express.js
Database	PostgreSQL
ORM	Prisma
Validation	Zod
Authentication	JWT, bcrypt
Payments	SSLCommerz
API Documentation	Swagger / OpenAPI
Code Quality	Biome
API Base URL
/api/v1
Local development URL:

http://localhost:5000/api/v1
Swagger documentation:

http://localhost:5000/api-docs
Main API Modules
Module	Base route	Purpose
Authentication	/auth	Registration, login, token refresh, logout, and profile access
Distribution Zones	/distribution-zones	Manage electricity distribution zones
Substations	/substations	Manage substations within zones
Feeders	/feeders	Manage feeders connected to substations
Areas	/areas	Manage customer service areas
Schedules	/schedules	Manage load-shedding schedules
Unexpected Outages	/unexpected-outages	Report and track unplanned outages
Assignments	/assignments	Assign technicians and track repair work
Bills	/bills	Manage customer electricity bills
Payments	/payments	Initiate and verify SSLCommerz payments
Admin	/admin	Administrative user and system operations
The complete and current endpoint list is available through Swagger at /api-docs.

Payment Endpoints
Method	Endpoint	Access	Description
POST	/api/v1/payments/initiate	Customer	Initiate payment for an unpaid bill
POST	/api/v1/payments/webhook	Public callback	Receive and validate an SSLCommerz callback/IPN
GET	/api/v1/payments/:id	Customer/Admin	Retrieve payment information using a bill ID
Payment Flow
The system or an Admin creates a bill for a Customer.

The Customer sends the existing bill ID to the payment-initiation endpoint.

The API creates a unique transaction ID and returns an SSLCommerz payment URL.

The Customer completes payment on the SSLCommerz hosted checkout page.

SSLCommerz calls the backend webhook.

The backend validates the payment with SSLCommerz.

After successful validation, the bill status becomes PAID and paidAt is recorded.

Project Structure
loadshedding-backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seedBills.ts
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├
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
Getting Started
Prerequisites
Install the following before running the project:

Node.js 20 or later

npm

PostgreSQL

Git

An SSLCommerz sandbox account for payment testing

1. Clone the repository
git clone <your-repository-url>
cd loadshedding-backend
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file in the project root:

NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

JWT_ACCESS_SECRET=replace_with_a_secure_access_secret
JWT_REFRESH_SECRET=replace_with_a_secure_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_TOKEN_COOKIE_DAYS=7

SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
Environment-variable names must match the names used by the project configuration.

4. Generate the Prisma Client
npx prisma generate
5. Apply the database schema
For development with migrations:

npx prisma migrate dev
Alternatively, push the schema without creating a migration:

npx prisma db push
6. Seed sample bills (optional)
npx --yes tsx prisma/seedBills.ts
The Customer referenced by the seed script must already exist in the database.

7. Start the development server
npm run dev
The server should be available at:

http://localhost:5000
Common Scripts
Command	Description
npm run dev	Start the development server
npm run build	Compile the TypeScript project
npm start	Start the compiled application
npx prisma generate	Generate the Prisma Client
npx prisma migrate dev	Apply development migrations
npx prisma studio	Open Prisma Studio
npx biome check .	Check formatting and lint issues
npx biome check --write .	Apply safe formatting and lint fixes
Available npm scripts may vary according to package.json.

Authentication
Protected endpoints require a JWT access token:

Authorization: Bearer <access_token>
Example:

GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Refresh tokens are stored in secure HTTP-only cookies when supported by the client.

Example: Initiate a Bill Payment
POST /api/v1/payments/initiate
Authorization: Bearer <customer_access_token>
Content-Type: application/json
Request body:

{
  "billId": "355d8890-d03d-4081-8ce0-1651b4ce8261"
}
Example response:

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
Open paymentUrl in a browser to continue through the SSLCommerz checkout.

Payment Testing Notes
Use an UNPAID bill owned by the authenticated Customer.

Do not call the webhook manually to complete a payment.

SSLCommerz sends fields such as tran_id and val_id to the webhook.

A fabricated val_id cannot pass server-side validation.

For reliable IPN testing, the backend webhook must be publicly accessible.

Use SSLCOMMERZ_IS_LIVE=false with sandbox credentials.

Never expose SSLCommerz credentials in frontend code or commit them to Git.

Error Response Format
An error response follows a consistent structure similar to:

{
  "success": false,
  "message": "Resource not found",
  "errorSources": []
}
Key Backend Challenges
Generating schedules without overlapping area, feeder, or time assignments

Enforcing valid outage-status transitions

Assigning available technicians based on workload and expertise

Preventing conflicting technician assignments

Maintaining consistent restoration history

Validating third-party payment callbacks securely

Preventing duplicate payment processing

Applying authorization consistently across roles

Security Considerations
Passwords are stored only after hashing.

Protected routes use JWT authentication and role checks.

Refresh tokens use HTTP-only cookies.

Incoming request data is validated with Zod.

Payment success is accepted only after server-side SSLCommerz validation.

Secret credentials are stored in environment variables.

Deleted records can be excluded through soft-delete conditions.

Production deployments should use HTTPS and restricted CORS origins.

Future Improvements
Automated load-shedding schedule generation

Schedule-conflict detection

SMS and email notifications

Real-time outage updates with WebSockets

GIS-based outage visualization

Technician workload optimization

Priority-based load distribution

Advanced analytics and downloadable reports

Audit logging

Automated overdue-bill processing
