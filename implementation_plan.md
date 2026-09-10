# Proposed PostgreSQL Database & Backend Setup with Prisma ORM

## Overview
This plan establishes a robust PostgreSQL database and a Node.js + Express backend powered by Prisma ORM for the **LocalOS** application. It faithfully models every entity, field, ID, and relationship currently managed in `AppContext.jsx` and across all frontend components.

---

## 1. Identified Entities & Domain Model

Based on inspection of `src/context/AppContext.jsx` and all consuming components (`Orders.jsx`, `Appointments.jsx`, `Customers.jsx`, `Staff.jsx`, `Services.jsx`, `Inventory.jsx`, `Settings.jsx`, `Notifications.jsx`, `Integrations.jsx`, `Insights.jsx`, `CustomerPortal.jsx`, `Login.jsx`):

| Entity | Primary Key Format | Description & Usage |
| :--- | :--- | :--- |
| **Business** | String (`biz_default` or CUID) | Salon brand settings, tax rate, deposit policy, cancellation window, and weekly hours. |
| **Staff** | String (`st-1`, `st-${Date.now()}`) | Service providers/stylists, commissions, ratings, active status, and avatars. |
| **Service** | String (`srv-1`, `srv-${Date.now()}`) | Salon services catalog with category, price, duration, buffer, and assigned staff. |
| **Customer** | String (`cust-1`, `cust-${Date.now()}`) | Client profiles with contact info, visit history, total spend, tags (VIP/Loyal/New/At-Risk), and notes. |
| **Appointment** | String (`apt-101`, `apt-${Date.now()}`) | Bookings linking customer, service, staff, date, time, status, price, and notes. |
| **InventoryItem** | String (`inv-1`, `inv-${Date.now()}`) | Products with SKU, category (Retail/Backbar/Equipment), stock, minStock, costs, prices, supplier. |
| **Order** | String (`ORD-9021`, `ORD-${random}`) | POS sales transactions with financial breakdown (subtotal, tax, tip, total), payment method, status. |
| **OrderItem** | String (CUID / UUID) | Individual items inside an order (service or retail product) with quantity and price snapshot. |
| **Insight** | String (`ins-1`, `ins-${Date.now()}`) | AI operational recommendations with category, impact, priority, description, and action text. |
| **Notification** | String (`notif-1`, `notif-${Date.now()}`) | Multi-channel broadcast and direct alerts (SMS, WhatsApp, System) with delivery status. |
| **Integration** | String (`int-stripe`, `int-whatsapp`) | Third-party service connectors (payments, messaging, calendars, accounting) with sync status. |
| **User** | String (CUID / UUID) | System users and staff authentication profiles (Owner, Stylists, Front Desk) with PIN/credentials. |

---

## 2. Proposed Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -------------------------------------------------------------
// 1. BUSINESS PROFILE & SETTINGS
// -------------------------------------------------------------
model Business {
  id                String   @id @default("biz_default")
  name              String   @default("Vanilla Spa & Salon")
  tagline           String   @default("Boutique Wellness, Hair & Aesthetic Care")
  owner             String   @default("Jane Doe")
  email             String   @default("hello@vanillasalon.com")
  phone             String   @default("+1 (555) 382-9912")
  address           String   @default("142 Orchard Grove Blvd, Suite 200, Seattle, WA")
  currency          String   @default("$")
  taxRate           Float    @default(0.085)
  depositPercent    Float    @default(20.0)
  cancellationHours Int      @default(24)
  hours             Json     // Monday-Sunday open/close/closed schedule object
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// -------------------------------------------------------------
// 2. STAFF / TEAM MEMBERS
// -------------------------------------------------------------
model Staff {
  id           String        @id // supports frontend IDs like 'st-1', 'st-2', or generated
  name         String
  role         String        @default("Hair Stylist")
  email        String        @unique
  phone        String
  commission   Float         @default(15.0)
  rating       Float         @default(5.0)
  active       Boolean       @default(true)
  avatar       String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  // Relationships
  appointments Appointment[]
  services     ServiceStaff[]
}

// -------------------------------------------------------------
// 3. SERVICES CATALOG
// -------------------------------------------------------------
model Service {
  id          String         @id // supports 'srv-1', 'srv-2', etc.
  category    String         // 'Hair', 'Skin & Spa', 'Nails', 'Massage', 'General'
  name        String
  duration    Int            // in minutes (e.g. 60, 120)
  price       Float
  buffer      Int            @default(10) // buffer minutes
  description String?
  staffIds    String[]       @default([]) // Direct array matching frontend srv.staffIds
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Relationships
  appointments Appointment[]
  staffMembers ServiceStaff[]
}

// Explicit Join table between Service & Staff for relational queries
model ServiceStaff {
  serviceId String
  staffId   String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  staff     Staff   @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@id([serviceId, staffId])
}

// -------------------------------------------------------------
// 4. CUSTOMERS / CLIENT DIRECTORY
// -------------------------------------------------------------
model Customer {
  id         String        @id // supports 'cust-1', 'cust-2', etc.
  name       String
  email      String?
  phone      String
  visits     Int           @default(0)
  totalSpend Float         @default(0.0)
  tag        String        @default("New") // 'VIP', 'Loyal', 'New', 'At-Risk'
  lastVisit  String?       @default("None") // e.g. '2026-03-08'
  notes      String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  // Relationships
  appointments Appointment[]
  orders       Order[]
}

// -------------------------------------------------------------
// 5. APPOINTMENTS & SCHEDULING
// -------------------------------------------------------------
model Appointment {
  id           String    @id // supports 'apt-101', 'apt-${Date.now()}'
  customerName String
  customerId   String?
  serviceName  String
  serviceId    String
  staffName    String
  staffId      String
  date         String    // ISO 'YYYY-MM-DD'
  time         String    // e.g. '10:00 AM'
  duration     Int       // minutes
  price        Float
  status       String    @default("confirmed") // 'confirmed', 'in-service', 'completed', 'cancelled'
  notes        String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relationships
  customer Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  service  Service   @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  staff    Staff     @relation(fields: [staffId], references: [id], onDelete: Restrict)
}

// -------------------------------------------------------------
// 6. INVENTORY MANAGEMENT
// -------------------------------------------------------------
model InventoryItem {
  id        String   @id // supports 'inv-1', 'inv-2', etc.
  name      String
  sku       String   @unique
  category  String   // 'Retail', 'Backbar', 'Equipment'
  stock     Int      @default(0)
  minStock  Int      @default(5)
  cost      Float    @default(0.0)
  price     Float    @default(0.0)
  supplier  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// -------------------------------------------------------------
// 7. POINT OF SALE (POS) & ORDERS
// -------------------------------------------------------------
model Order {
  id            String      @id // supports 'ORD-9021', 'ORD-${random}'
  customerName  String
  customerId    String?
  subtotal      Float
  tax           Float
  tip           Float       @default(0.0)
  total         Float
  paymentMethod String      @default("Credit Card") // 'Credit Card', 'Apple Pay', 'Cash'
  status        String      @default("Completed")   // 'Completed', 'Refunded'
  date          String      // 'YYYY-MM-DD'
  time          String      // '10:32 AM'
  itemsSnapshot Json?       // Raw JSON array [{ name, price, qty }] preserving frontend format
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relationships
  customer Customer?   @relation(fields: [customerId], references: [id], onDelete: SetNull)
  items    OrderItem[]
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  name      String
  price     Float
  qty       Int      @default(1)
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

// -------------------------------------------------------------
// 8. AI INSIGHTS & RECOMMENDATIONS
// -------------------------------------------------------------
model Insight {
  id          String   @id // supports 'ins-1', 'ins-2'
  title       String
  category    String   // 'Revenue Optimization', 'Client Retention', 'Inventory Health', etc.
  impact      String   // e.g. '+$420 / week', 'Avoid Disruption'
  priority    String   // 'Critical', 'High', 'Medium', 'Low'
  description String
  actionText  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// -------------------------------------------------------------
// 9. NOTIFICATIONS & ALERTS
// -------------------------------------------------------------
model Notification {
  id        String   @id // supports 'notif-1'
  recipient String   // e.g. 'Alexander Wright', 'Jane Doe (Manager)'
  channel   String   // 'SMS', 'WhatsApp', 'System'
  type      String   // 'Appointment Reminder', 'Booking Confirmation', 'Low Stock Alert'
  message   String
  time      String   // e.g. '2 hours ago', or human relative format
  status    String   @default("Delivered") // 'Delivered', 'Read', 'Unread', 'Sent'
  createdAt DateTime @default(now())
}

// -------------------------------------------------------------
// 10. INTEGRATIONS & CONNECTORS
// -------------------------------------------------------------
model Integration {
  id          String   @id // supports 'int-stripe', 'int-whatsapp', etc.
  name        String
  category    String   // 'Payment Processing', 'Messaging & Alerts', 'Scheduling'
  status      String   @default("Connected") // 'Connected', 'Disconnected'
  icon        String   // 'CreditCard', 'MessageCircle', 'Calendar', etc.
  description String
  lastSync    String   @default("Real-time")
  apiKey      String?
  updatedAt   DateTime @updatedAt
}

// -------------------------------------------------------------
// 11. SYSTEM USER / AUTH PROFILE
// -------------------------------------------------------------
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      String   @default("Business Owner") // 'Business Owner', 'Lead Hair Stylist', etc.
  pin       String?  // 4-digit PIN for terminal/floor quick-login
  password  String?  // Hashed password
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 3. Backend Architecture (Node.js + Express)

A clean `server/` directory will house the backend API:
```
server/
├── prisma/
│   ├── schema.prisma
│   └── seed.js             # Seeds existing INITIAL_* data from AppContext
├── src/
│   ├── config/
│   │   └── db.js           # Prisma client singleton instance
│   ├── routes/
│   │   ├── business.js     # GET /api/business, PUT /api/business
│   │   ├── staff.js        # GET, POST, PUT /api/staff
│   │   ├── services.js     # GET, POST, PUT /api/services
│   │   ├── customers.js    # GET, POST, PUT /api/customers
│   │   ├── appointments.js # GET, POST, PATCH /api/appointments
│   │   ├── inventory.js    # GET, POST, PATCH /api/inventory
│   │   ├── orders.js       # GET, POST /api/orders
│   │   ├── insights.js     # GET, POST /api/insights
│   │   ├── notifications.js# GET, POST /api/notifications
│   │   └── integrations.js # GET, PATCH /api/integrations
│   └── index.js            # Express app, CORS, error handling, JSON body parser
├── .env                    # PORT, DATABASE_URL, CORS origin
└── package.json            # express, cors, dotenv, @prisma/client, prisma, nodemon
```

### Safety & Non-breaking Principle
- Frontend code and UI in `src/` remain completely untouched until the backend, migrations, and database connection are verified.
- The schema accommodates the exact ID strings (`st-1`, `srv-1`, `cust-1`, `apt-101`, `ORD-9021`, etc.) and payload shapes currently used by `AppContext.jsx`.

---

## 4. Verification Plan

### Database & Migrations
1. Run `npx prisma validate` to confirm schema validity.
2. Verify connection to PostgreSQL using provided `DATABASE_URL`.
3. Run `npx prisma migrate dev --name init` or `npx prisma db push`.
4. Execute `node server/prisma/seed.js` to populate the database with the initial demo data from `AppContext.jsx`.

### Backend API Verification
1. Start Express server: `node server/src/index.js`.
2. Test health check endpoint: `GET http://localhost:5000/api/health`.
3. Test entity endpoints (`GET /api/services`, `GET /api/staff`, `GET /api/appointments`, etc.) and confirm JSON matches frontend requirements.
