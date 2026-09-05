-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TECHNICIAN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('LOAD_SHEDDING', 'PLANNED_OUTAGE');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutageStatus" AS ENUM ('REPORTED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCHEDULE_CREATED', 'OUTAGE_REPORTED', 'TECHNICIAN_ASSIGNED', 'STATUS_UPDATED', 'POWER_RESTORED', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "profileImage" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "areaId" TEXT,
    "employeeId" TEXT,
    "skill" TEXT,
    "experienceYears" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "distribution_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substations" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "capacityMw" DOUBLE PRECISION,
    "voltageLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "substations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeders" (
    "id" TEXT NOT NULL,
    "substationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "capacityMw" DOUBLE PRECISION,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "feederId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "population" INTEGER,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_shedding_schedules" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ScheduleType" NOT NULL DEFAULT 'LOAD_SHEDDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "load_shedding_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unexpected_outages" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "OutageStatus" NOT NULL DEFAULT 'REPORTED',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedRestoreAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unexpected_outages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_assignments" (
    "id" TEXT NOT NULL,
    "outageId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "notes" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "technician_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_updates" (
    "id" TEXT NOT NULL,
    "outageId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "status" "OutageStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outage_history" (
    "id" TEXT NOT NULL,
    "outageId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "previousStatus" "OutageStatus",
    "currentStatus" "OutageStatus" NOT NULL,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outage_resolutions" (
    "id" TEXT NOT NULL,
    "outageId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT,
    "durationMinutes" INTEGER,
    "restoredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outage_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outageId" TEXT,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_areaId_idx" ON "users"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_zones_code_key" ON "distribution_zones"("code");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_zones_name_key" ON "distribution_zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "substations_code_key" ON "substations"("code");

-- CreateIndex
CREATE INDEX "substations_zoneId_idx" ON "substations"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "substations_zoneId_name_key" ON "substations"("zoneId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "feeders_code_key" ON "feeders"("code");

-- CreateIndex
CREATE INDEX "feeders_substationId_idx" ON "feeders"("substationId");

-- CreateIndex
CREATE UNIQUE INDEX "feeders_substationId_name_key" ON "feeders"("substationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "areas_code_key" ON "areas"("code");

-- CreateIndex
CREATE INDEX "areas_feederId_idx" ON "areas"("feederId");

-- CreateIndex
CREATE INDEX "areas_priority_idx" ON "areas"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "areas_feederId_name_key" ON "areas"("feederId", "name");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_areaId_idx" ON "load_shedding_schedules"("areaId");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_createdById_idx" ON "load_shedding_schedules"("createdById");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_scheduledStart_scheduledEnd_idx" ON "load_shedding_schedules"("scheduledStart", "scheduledEnd");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_areaId_status_idx" ON "load_shedding_schedules"("areaId", "status");

-- CreateIndex
CREATE INDEX "unexpected_outages_areaId_idx" ON "unexpected_outages"("areaId");

-- CreateIndex
CREATE INDEX "unexpected_outages_reportedById_idx" ON "unexpected_outages"("reportedById");

-- CreateIndex
CREATE INDEX "unexpected_outages_status_idx" ON "unexpected_outages"("status");

-- CreateIndex
CREATE INDEX "unexpected_outages_priority_idx" ON "unexpected_outages"("priority");

-- CreateIndex
CREATE INDEX "unexpected_outages_areaId_status_idx" ON "unexpected_outages"("areaId", "status");

-- CreateIndex
CREATE INDEX "unexpected_outages_reportedAt_idx" ON "unexpected_outages"("reportedAt");

-- CreateIndex
CREATE INDEX "technician_assignments_outageId_idx" ON "technician_assignments"("outageId");

-- CreateIndex
CREATE INDEX "technician_assignments_technicianId_status_idx" ON "technician_assignments"("technicianId", "status");

-- CreateIndex
CREATE INDEX "technician_assignments_assignedById_idx" ON "technician_assignments"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "technician_assignments_outageId_technicianId_key" ON "technician_assignments"("outageId", "technicianId");

-- CreateIndex
CREATE INDEX "repair_updates_outageId_createdAt_idx" ON "repair_updates"("outageId", "createdAt");

-- CreateIndex
CREATE INDEX "repair_updates_technicianId_idx" ON "repair_updates"("technicianId");

-- CreateIndex
CREATE INDEX "outage_history_outageId_changedAt_idx" ON "outage_history"("outageId", "changedAt");

-- CreateIndex
CREATE INDEX "outage_history_changedById_idx" ON "outage_history"("changedById");

-- CreateIndex
CREATE UNIQUE INDEX "outage_resolutions_outageId_key" ON "outage_resolutions"("outageId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_outageId_idx" ON "notifications"("outageId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "distribution_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeders" ADD CONSTRAINT "feeders_substationId_fkey" FOREIGN KEY ("substationId") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_schedules" ADD CONSTRAINT "load_shedding_schedules_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_schedules" ADD CONSTRAINT "load_shedding_schedules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unexpected_outages" ADD CONSTRAINT "unexpected_outages_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unexpected_outages" ADD CONSTRAINT "unexpected_outages_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_assignments" ADD CONSTRAINT "technician_assignments_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "unexpected_outages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_assignments" ADD CONSTRAINT "technician_assignments_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_assignments" ADD CONSTRAINT "technician_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_updates" ADD CONSTRAINT "repair_updates_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "unexpected_outages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_updates" ADD CONSTRAINT "repair_updates_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_history" ADD CONSTRAINT "outage_history_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "unexpected_outages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_history" ADD CONSTRAINT "outage_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_resolutions" ADD CONSTRAINT "outage_resolutions_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "unexpected_outages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "unexpected_outages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
