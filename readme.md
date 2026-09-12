
b3b8c3c3-7196-47ce-9e08-256bed9aef28.png
ei schema onusare 10 ta bill json data daw db te rakhay jonno ar ei data kivabe db te push korbo bolo} 
 enum BillStatus {
  UNPAID
  PAID
  OVERDUE
  CANCELLED
} 
// ======================================================
// BILLING AND PAYMENTS
// ======================================================

model Bill {
  id            String     @id @default(uuid())
  userId        String
  billNumber    String     @unique
  month         String     // e.g., "September 2026"
  amount        Float
  dueDate       DateTime
  status        BillStatus @default(UNPAID)
  
  // Payment Gateway Information
  transactionId String?    @unique
  paymentMethod String?    // e.g., "STRIPE", "SSLCOMMERZ", "BKASH"
  paidAt        DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([userId])
  @@index([status])
  @@index([billNumber])
  @@map("bills")
}

87c42601-f6ad-4c8c-809b-0fbd549f3c45.png
payment success na bole eta bole keno}import type { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsyc";

const initiatePayment = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await PaymentService.initiatePayment(
      req.body.billId,
      user.userId,
    );

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  },
);

const webhook = catchAsync(
  async (req: Request, res: Response) => {
    const callbackType =
      typeof req.query.callback === "string"
        ? req.query.callback
        : undefined;

    const result = await PaymentService.handleWebhook(
      req.body,
      callbackType,
    );

    /*
     * IPN is server-to-server, তাই JSON response দেওয়া হবে।
     */
    if (callbackType === "ipn") {
      res.status(200).json({
        success: true,
        message: "Payment notification received",
        data: result,
      });

      return;
    }

    /*
     * Customer browser callback হলে frontend-এ পাঠানো হবে।
     */
    const redirectUrl = new URL(
      "/payment/result",
      process.env.BACKEND_URL ||
        "http://localhost:5000",
    );

    redirectUrl.searchParams.set(
      "status",
      result.status,
    );

    redirectUrl.searchParams.set(
      "transactionId",
      result.transactionId,
    );

    if ("billId" in result && result.billId) {
      redirectUrl.searchParams.set(
        "billId",
        result.billId,
      );
    }

    if ("bill" in result && result.bill?.id) {
      redirectUrl.searchParams.set(
        "billId",
        result.bill.id,
      );
    }

    res.redirect(303, redirectUrl.toString());
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await PaymentService.getPaymentById(
      req.params.id,
      {
        userId: user.userId,
        role: user.role,
      },
    );

    res.status(200).json({
      success: true,
      message: "Payment information retrieved successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  initiatePayment,
  webhook,
  getPaymentById,
};

c5628ea4-1e3c-4645-bd8f-e36f9e93f04b.png
ei error dey keno]

03272be3-15fc-48fd-8102-f197c0f088fd.png
2234e6d1-6f3e-4122-95ba-5513bfa2984a.png
ki somossa hoy na}


Pasted text(20260912-183820).txt
Document
vai amar db te to powerauthority name kichhu nai tumi shurutei et adichhu ,, ei project e ki powerauthority name table crud operation eigula thaktei hobe system onusare ei dekho amar schema powerautjority nam eto kichuu nai }


Pasted text(20260912-190025).txt
Document
assignment module er ekhane repare update ar resolved er jonno ki code dibo jate repare update tab;le outage table e data save hoy}import { Router } from "express"; 
import { auth } from "../../middlewares/auth"; 
import { validateRequest } from "../../middlewares/validateRequest"; 
import { TechnicianAssignmentValidation } from "./assignment.validation"; 
import { TechnicianAssignmentController } from "./assignment.controller"; 
 
 
const router = Router(); 
 
/** 
 * @openapi 
 * components: 
 *   schemas: 
 *     TechnicianAssignment: 
 *       type: object 
 *       properties: 
 *         id: 
 *           type: string 
 *           format: uuid 
 *         outageId: 
 *           type: string 
 *           format: uuid 
 *         technicianId: 
 *           type: string 
 *           format: uuid 
 *         assignedById: 
 *           type: string 
 *           format: uuid 
 *         status: 
 *           type: string 
 *           enum: 
 *             - ASSIGNED 
 *             - ACCEPTED 
 *             - REJECTED 
 *             - IN_PROGRESS 
 *             - COMPLETED 
 *         notes: 
 *           type: string 
 *           nullable: true 
 *         assignedAt: 
 *           type: string 
 *           format: date-time 
 *         acceptedAt: 
 *           type: string 
 *           format: date-time 
 *           nullable: true 
 *         startedAt: 
 *           type: string 
 *           format: date-time 
 *           nullable: true 
 *         completedAt: 
 *           type: string 
 *           format: date-time 
 *           nullable: true 
 * 
 *     CreateTechnicianAssignment: 
 *       type: object 
 *       required: 
 *         - outageId 
 *         - technicianId 
 *       properties: 
 *         outageId: 
 *           type: string 
 *           format: uuid 
 *         technicianId: 
 *           type: string 
 *           format: uuid 
 *         notes: 
 *           type: string 
 *           example: Check transformer and feeder connection 
 * 
 *     UpdateAssignmentStatus: 
 *       type: object 
 *       required: 
 *         - status 
 *       properties: 
 *         status: 
 *           type: string 
 *           enum: 
 *             - ACCEPTED 
 *             - REJECTED 
 *             - IN_PROGRESS 
 *             - COMPLETED 
 *         notes: 
 *           type: string 
 *           example: Repair work has started 
 */ 
 
/** 
 * @openapi 
 * /assignments: 
 *   post: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Assign a technician to an unexpected outage 
 *     security: 
 *       - bearerAuth: [] 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             $ref: '#/components/schemas/CreateTechnicianAssignment' 
 *     responses: 
 *       201: 
 *         description: Technician assigned successfully 
 *       400: 
 *         description: Invalid request 
 *       403: 
 *         description: Admin access required 
 *       404: 
 *         description: Outage or technician not found 
 *       409: 
 *         description: Technician already assigned 
 * 
 *   get: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Get all technician assignments 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: query 
 *         name: page 
 *         schema: 
 *           type: integer 
 *           default: 1 
 *       - in: query 
 *         name: limit 
 *         schema: 
 *           type: integer 
 *           default: 10 
 *       - in: query 
 *         name: status 
 *         schema: 
 *           type: string 
 *           enum: 
 *             - ASSIGNED 
 *             - ACCEPTED 
 *             - REJECTED 
 *             - IN_PROGRESS 
 *             - COMPLETED 
 *       - in: query 
 *         name: technicianId 
 *         schema: 
 *           type: string 
 *           format: uuid 
 *       - in: query 
 *         name: outageId 
 *         schema: 
 *           type: string 
 *           format: uuid 
 *       - in: query 
 *         name: search 
 *         schema: 
 *           type: string 
 *       - in: query 
 *         name: sortBy 
 *         schema: 
 *           type: string 
 *           enum: 
 *             - assignedAt 
 *             - createdAt 
 *             - updatedAt 
 *             - status 
 *       - in: query 
 *         name: sortOrder 
 *         schema: 
 *           type: string 
 *           enum: 
 *             - asc 
 *             - desc 
 *     responses: 
 *       200: 
 *         description: Assignments retrieved successfully 
 */ 
router 
  .route("/") 
  .post( 
    auth("ADMIN"), 
    validateRequest( 
      TechnicianAssignmentValidation.createTechnicianAssignmentSchema, 
    ), 
    TechnicianAssignmentController.createAssignment, 
  ) 
  .get( 
    auth("ADMIN"), 
    TechnicianAssignmentController.getAllAssignments, 
  ); 
 
/** 
 * @openapi 
 * /assignments/my-assignments: 
 *   get: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Get logged-in technician assignments 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: query 
 *         name: page 
 *         schema: 
 *           type: integer 
 *           default: 1 
 *       - in: query 
 *         name: limit 
 *         schema: 
 *           type: integer 
 *           default: 10 
 *       - in: query 
 *         name: status 
 *         schema: 
 *           type: string 
 *           enum: 
 *             - ASSIGNED 
 *             - ACCEPTED 
 *             - REJECTED 
 *             - IN_PROGRESS 
 *             - COMPLETED 
 *       - in: query 
 *         name: sortBy 
 *         schema: 
 *           type: string 
 *           enum: 
 *             - assignedAt 
 *             - createdAt 
 *             - updatedAt 
 *             - status 
 *       - in: query 
 *         name: sortOrder 
 *         schema: 
 *           type: string 
 *           enum: 
 *             - asc 
 *             - desc 
 *     responses: 
 *       200: 
 *         description: Technician assignments retrieved successfully 
 */ 
router.get( 
  "/my-assignments", 
  auth("TECHNICIAN"), 
  TechnicianAssignmentController.getMyAssignments, 
); 
 
/** 
 * @openapi 
 * /assignments/{id}/status: 
 *   patch: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Update own assignment status 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: path 
 *         name: id 
 *         required: true 
 *         schema: 
 *           type: string 
 *           format: uuid 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             $ref: '#/components/schemas/UpdateAssignmentStatus' 
 *     responses: 
 *       200: 
 *         description: Assignment status updated successfully 
 *       400: 
 *         description: Invalid status transition 
 *       404: 
 *         description: Assignment not found 
 */ 
router.patch( 
  "/:id/status", 
  auth("TECHNICIAN"), 
  validateRequest( 
    TechnicianAssignmentValidation.updateAssignmentStatusSchema, 
  ), 
  TechnicianAssignmentController.updateAssignmentStatus, 
); 
 
/** 
 * @openapi 
 * /assignments/{id}: 
 *   get: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Get assignment by ID 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: path 
 *         name: id 
 *         required: true 
 *         schema: 
 *           type: string 
 *           format: uuid 
 *     responses: 
 *       200: 
 *         description: Assignment retrieved successfully 
 *       403: 
 *         description: Access denied 
 *       404: 
 *         description: Assignment not found 
 * 
 *   patch: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Reassign technician or update notes 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: path 
 *         name: id 
 *         required: true 
 *         schema: 
 *           type: string 
 *           format: uuid 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             type: object 
 *             properties: 
 *               technicianId: 
 *                 type: string 
 *                 format: uuid 
 *               notes: 
 *                 type: string 
 *                 nullable: true 
 *     responses: 
 *       200: 
 *         description: Assignment updated successfully 
 * 
 *   delete: 
 *     tags: 
 *       - Technician Assignments 
 *     summary: Soft delete an assignment 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: path 
 *         name: id 
 *         required: true 
 *         schema: 
 *           type: string 
 *           format: uuid 
 *     responses: 
 *       200: 
 *         description: Assignment deleted successfully 
 */ 
router 
  .route("/:id") 
  .get( 
    auth("ADMIN", "TECHNICIAN"), 
    TechnicianAssignmentController.getAssignmentById, 
  ) 
  .patch( 
    auth("ADMIN"), 
    validateRequest( 
      TechnicianAssignmentValidation.updateTechnicianAssignmentSchema, 
    ), 
    TechnicianAssignmentController.updateAssignment, 
  ) 
  .delete( 
    auth("ADMIN"), 
    TechnicianAssignmentController.deleteAssignment, 
  ); 
 
export const TechnicianAssignmentRoutes = router; 
,,

Biome দিয়ে পুরো project format ও safe fix করতে project root terminal-এ চালাও:

npx biome check --write .
শুধু formatting করতে চাইলে:

npx biome format --write .
আগে সমস্যা check করতে চাইলে:

npx biome check .
সব diagnostics দেখতে:

npx biome check --max-diagnostics=200 .
Recommended sequence:

npx biome check .
npx biome check --write .
npx biome check .
--write formatting এবং safe lint fixes apply করবে। Unsafe fixes নিজে থেকে প্রয়োগ করবে না। Unsafe fixes preview করতে:

npx biome check --fix --unsafe .
তবে শেষের command এখন ব্যবহার না করাই ভালো, কারণ unsafe fix code logic পরিবর্তন করতে পারে। তোমার জন্য safest command:

npx biome check --write .

 

Skipped 6 suggested fixes.
If you wish to apply the suggested (unsafe) fixes, use the command biome check --write --unsafe

Checked 60 files in 339ms. Fixed 16 files.
Found 2 errors.
Found 12 warnings.
check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  × Some errors were emitted while applying fixes.
  


my@DESKTOP-3090OBG MINGW64 /d/Level2webs/loadshedding/loadshedding-backend (main)$ 



Biome successfully ১৬টি file format/fix করেছে। এখনো ২টি error এবং ১২টি warning আছে। শুধু এই summary দেখে কোন file-এর কোন line-এ error আছে বোঝা যাচ্ছে না।

সব diagnostics দেখার জন্য চালাও:

npx biome check . --max-diagnostics=100
শুধু error/warning report নিয়ে text file বানাতে চাইলে:

npx biome check . --max-diagnostics=100 > biome-errors.txt 2>&1
তারপর biome-errors.txt-এর content দিলে exact code fix করে দিতে পারব।

এখনই এই command চালিও না:

npx biome check --write --unsafe .
কারণ ৬টি unsafe suggestion-এর মধ্যে import, assertion অথবা code structure পরিবর্তন থাকতে পারে। আগে diagnostics দেখে তারপর প্রয়োজনীয় fix manually করা নিরাপদ।

বর্তমান result-এর অর্থ:

Fixed 16 files — formatting/safe fixes সফল

Found 2 errors — এগুলো অবশ্যই fix করা উচিত

Found 12 warnings — project run বন্ধ নাও করতে পারে

Skipped 6 suggested fixes — unsafe হওয়ায় Biome নিজে প্রয়োগ করেনি

পরবর্তী command:

npx biome check . --max-diagnostics=100

tumi amar readme md ta abr likhe daw just important correct info diye extra kichhu likhar dorkar nai

README-টি আবার সংক্ষিপ্ত ও correct তথ্য দিয়ে লিখেছি। আলাদা PowerAuthority বাদ দেওয়া হয়েছে এবং তোমার actual project flow রাখা হয়েছে।

README.md

এটি download করে backend project-এর root-এর পুরোনো README.md replace করবে। তারপর:

git add README.md
git commit -m "docs: update project README"
git push origin main

README.md
Document


Library
/
README.md


Load Shedding & Power Outage Management System
A role-based REST API for managing electricity distribution infrastructure, load-shedding schedules, unexpected outages, customer reports, technician assignments, restoration progress, utility bills, and online payments.

This backend is designed for utility providers that need a structured way to coordinate power distribution and outage response across distribution zones, substations, feeders, and service areas.

System Flow
Power Authority
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

Author
Fahmida Akter Tanjina

License
This project is intended for educational and portfolio purposes.

