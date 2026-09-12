import { prisma } from "../src/app/config/prisma";

const seedBills = async () => {
  const customer = await prisma.user.findFirst({
    where: {
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!customer) {
    throw new Error(
      "No active CUSTOMER found. Register a customer first.",
    );
  }

  console.log("Bills will be created for:", customer);

  const bills = [
    {
      userId:"cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-001",
      month: "January 2026",
      amount: 1250,
      dueDate: new Date("2026-01-31T23:59:59.000Z"),
      status: "PAID" as const,
      transactionId: "SSLCZ-JAN-2026-001",
      paymentMethod: "SSLCOMMERZ",
      paidAt: new Date("2026-01-25T10:30:00.000Z"),
    },
    {
      userId:"cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-002",
      month: "February 2026",
      amount: 1380,
      dueDate: new Date("2026-02-28T23:59:59.000Z"),
      status: "PAID" as const,
      transactionId: "SSLCZ-FEB-2026-002",
      paymentMethod: "SSLCOMMERZ",
      paidAt: new Date("2026-02-24T09:15:00.000Z"),
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-003",
      month: "March 2026",
      amount: 1425.5,
      dueDate: new Date("2026-03-31T23:59:59.000Z"),
      status: "PAID" as const,
      transactionId: "SSLCZ-MAR-2026-003",
      paymentMethod: "BKASH",
      paidAt: new Date("2026-03-29T14:20:00.000Z"),
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-004",
      month: "April 2026",
      amount: 1575,
      dueDate: new Date("2026-04-30T23:59:59.000Z"),
      status: "PAID" as const,
      transactionId: "SSLCZ-APR-2026-004",
      paymentMethod: "SSLCOMMERZ",
      paidAt: new Date("2026-04-27T11:45:00.000Z"),
    },
    {
      userId:"cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-005",
      month: "May 2026",
      amount: 1690,
      dueDate: new Date("2026-05-31T23:59:59.000Z"),
      status: "PAID" as const,
      transactionId: "SSLCZ-MAY-2026-005",
      paymentMethod: "SSLCOMMERZ",
      paidAt: new Date("2026-05-28T16:10:00.000Z"),
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-006",
      month: "June 2026",
      amount: 1820,
      dueDate: new Date("2026-06-30T23:59:59.000Z"),
      status: "OVERDUE" as const,
      transactionId: null,
      paymentMethod: null,
      paidAt: null,
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-007",
      month: "July 2026",
      amount: 1950,
      dueDate: new Date("2026-07-31T23:59:59.000Z"),
      status: "OVERDUE" as const,
      transactionId: null,
      paymentMethod: null,
      paidAt: null,
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-008",
      month: "August 2026",
      amount: 2100,
      dueDate: new Date("2026-08-31T23:59:59.000Z"),
      status: "UNPAID" as const,
      transactionId: null,
      paymentMethod: null,
      paidAt: null,
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-009",
      month: "September 2026",
      amount: 2250.75,
      dueDate: new Date("2026-09-30T23:59:59.000Z"),
      status: "UNPAID" as const,
      transactionId: null,
      paymentMethod: null,
      paidAt: null,
    },
    {
      userId: "cfc9e9b7-0622-48ff-8057-c944a2430eee",
      billNumber: "ELEC-2026-010",
      month: "October 2026",
      amount: 1750,
      dueDate: new Date("2026-10-31T23:59:59.000Z"),
      status: "CANCELLED" as const,
      transactionId: null,
      paymentMethod: null,
      paidAt: null,
    },
  ];

  const result = await prisma.bill.createMany({
    data: bills,
    skipDuplicates: true,
  });

  console.log(`${result.count} bills created successfully`);
};

seedBills()
  .catch((error) => {
    console.error("Bill seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });