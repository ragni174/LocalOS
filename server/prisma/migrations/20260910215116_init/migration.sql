-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('CONFIRMED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CustomerTag" AS ENUM ('VIP', 'LOYAL', 'NEW', 'AT_RISK');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('COMPLETED', 'PENDING', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('SERVICE', 'PRODUCT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'APPLE_PAY', 'CASH', 'GIFT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('RETAIL', 'BACKBAR', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'WHATSAPP', 'SYSTEM', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('DELIVERED', 'READ', 'UNREAD', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL DEFAULT 'biz_default',
    "name" TEXT NOT NULL DEFAULT 'Vanilla Spa & Salon',
    "tagline" TEXT NOT NULL DEFAULT 'Boutique Wellness, Hair & Aesthetic Care',
    "owner" TEXT NOT NULL DEFAULT 'Jane Doe',
    "email" TEXT NOT NULL DEFAULT 'hello@vanillasalon.com',
    "phone" TEXT NOT NULL DEFAULT '+1 (555) 382-9912',
    "address" TEXT NOT NULL DEFAULT '142 Orchard Grove Blvd, Suite 200, Seattle, WA',
    "currency" TEXT NOT NULL DEFAULT '$',
    "taxRate" DECIMAL(5,4) NOT NULL DEFAULT 0.0850,
    "depositPercent" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "cancellationHours" INTEGER NOT NULL DEFAULT 24,
    "hours" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "staffId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "pinHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Hair Stylist',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "commission" DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "buffer" INTEGER NOT NULL DEFAULT 10,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceStaff" (
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "ServiceStaff_pkey" PRIMARY KEY ("serviceId","staffId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "totalSpend" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "tag" "CustomerTag" NOT NULL DEFAULT 'NEW',
    "lastVisit" TIMESTAMPTZ,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "customerId" TEXT,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ NOT NULL,
    "priceAtBooking" DECIMAL(10,2) NOT NULL,
    "durationAtBooking" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL DEFAULT 'RETAIL',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "supplier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "customerId" TEXT,
    "customerName" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "tip" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "orderId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "serviceId" TEXT,
    "itemType" "OrderItemType" NOT NULL DEFAULT 'CUSTOM',
    "name" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "orderId" TEXT,
    "appointmentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "tipAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "transactionId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "actionText" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "recipient" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'SMS',
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'DELIVERED',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL DEFAULT 'biz_default',
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lastSync" TEXT NOT NULL DEFAULT 'Real-time',
    "keyPreview" TEXT,
    "encryptedCredentials" TEXT,
    "config" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_businessId_idx" ON "User"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "User_businessId_email_key" ON "User"("businessId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_businessId_staffId_key" ON "User"("businessId", "staffId");

-- CreateIndex
CREATE INDEX "Staff_businessId_idx" ON "Staff"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_businessId_id_key" ON "Staff"("businessId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_businessId_email_key" ON "Staff"("businessId", "email");

-- CreateIndex
CREATE INDEX "Service_businessId_idx" ON "Service"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_businessId_id_key" ON "Service"("businessId", "id");

-- CreateIndex
CREATE INDEX "ServiceStaff_businessId_staffId_idx" ON "ServiceStaff"("businessId", "staffId");

-- CreateIndex
CREATE INDEX "Customer_businessId_phone_idx" ON "Customer"("businessId", "phone");

-- CreateIndex
CREATE INDEX "Customer_businessId_email_idx" ON "Customer"("businessId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_businessId_id_key" ON "Customer"("businessId", "id");

-- CreateIndex
CREATE INDEX "Appointment_businessId_startTime_idx" ON "Appointment"("businessId", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_businessId_staffId_startTime_idx" ON "Appointment"("businessId", "staffId", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_businessId_customerId_idx" ON "Appointment"("businessId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_businessId_id_key" ON "Appointment"("businessId", "id");

-- CreateIndex
CREATE INDEX "InventoryItem_businessId_idx" ON "InventoryItem"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_businessId_id_key" ON "InventoryItem"("businessId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_businessId_sku_key" ON "InventoryItem"("businessId", "sku");

-- CreateIndex
CREATE INDEX "Order_businessId_createdAt_idx" ON "Order"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_businessId_customerId_idx" ON "Order"("businessId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_businessId_id_key" ON "Order"("businessId", "id");

-- CreateIndex
CREATE INDEX "OrderItem_businessId_orderId_idx" ON "OrderItem"("businessId", "orderId");

-- CreateIndex
CREATE INDEX "OrderItem_businessId_inventoryItemId_idx" ON "OrderItem"("businessId", "inventoryItemId");

-- CreateIndex
CREATE INDEX "Payment_businessId_createdAt_idx" ON "Payment"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_businessId_orderId_idx" ON "Payment"("businessId", "orderId");

-- CreateIndex
CREATE INDEX "Insight_businessId_idx" ON "Insight"("businessId");

-- CreateIndex
CREATE INDEX "Notification_businessId_createdAt_idx" ON "Notification"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Integration_businessId_idx" ON "Integration"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_businessId_id_key" ON "Integration"("businessId", "id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_staffId_fkey" FOREIGN KEY ("businessId", "staffId") REFERENCES "Staff"("businessId", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStaff" ADD CONSTRAINT "ServiceStaff_businessId_serviceId_fkey" FOREIGN KEY ("businessId", "serviceId") REFERENCES "Service"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStaff" ADD CONSTRAINT "ServiceStaff_businessId_staffId_fkey" FOREIGN KEY ("businessId", "staffId") REFERENCES "Staff"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_customerId_fkey" FOREIGN KEY ("businessId", "customerId") REFERENCES "Customer"("businessId", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_serviceId_fkey" FOREIGN KEY ("businessId", "serviceId") REFERENCES "Service"("businessId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_staffId_fkey" FOREIGN KEY ("businessId", "staffId") REFERENCES "Staff"("businessId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_customerId_fkey" FOREIGN KEY ("businessId", "customerId") REFERENCES "Customer"("businessId", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_businessId_orderId_fkey" FOREIGN KEY ("businessId", "orderId") REFERENCES "Order"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_businessId_inventoryItemId_fkey" FOREIGN KEY ("businessId", "inventoryItemId") REFERENCES "InventoryItem"("businessId", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_businessId_serviceId_fkey" FOREIGN KEY ("businessId", "serviceId") REFERENCES "Service"("businessId", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_orderId_fkey" FOREIGN KEY ("businessId", "orderId") REFERENCES "Order"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_appointmentId_fkey" FOREIGN KEY ("businessId", "appointmentId") REFERENCES "Appointment"("businessId", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
