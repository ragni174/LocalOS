import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse, addMinutes, format, isBefore, isEqual } from 'date-fns';
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Helper to convert Decimal to Number for frontend
const convertDecimals = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertDecimals);
  
  if (typeof obj.toNumber === 'function') {
    return obj.toNumber();
  }

  if (obj instanceof Date) return obj;
  
  const res = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value.toNumber === 'function') {
      res[key] = value.toNumber();
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      res[key] = convertDecimals(value);
    } else {
      res[key] = value;
    }
  }
  return res;
};

// ------------------------------------------------------------------
// HEALTH ENDPOINT
// ------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Database disconnected' });
  }
});

// ------------------------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ------------------------------------------------------------------
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    // Overwrite req.business to securely use the token's businessId
    req.business = { id: decoded.businessId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

const authorize = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// ------------------------------------------------------------------
// AUTH ROUTES
// ------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password, pin } = req.body;
  try {
    let user;
    // We enforce business isolation by restricting login to 'biz_default' for now,
    // as per instructions: "For the current local single-business environment, use an appropriate development-safe business context."
    const businessId = 'biz_default'; 

    if (pin) {
      const users = await prisma.user.findMany({
        where: { businessId, pinHash: { not: null } }
      });
      for (const u of users) {
        if (await bcrypt.compare(pin, u.pinHash)) {
          user = u;
          break;
        }
      }
      if (!user) return res.status(401).json({ error: 'Invalid PIN' });
    } else if (email && password) {
      user = await prisma.user.findFirst({
        where: { email, businessId }
      });
      if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, businessId: user.businessId, role: user.role, staffId: user.staffId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '12h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000
    });

    const { passwordHash, pinHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    if (!user || user.businessId !== req.business.id) {
      return res.status(404).json({ error: 'User not found in this business context' });
    }
    const { passwordHash, pinHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// BUSINESS
// ------------------------------------------------------------------
app.get('/api/business', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    const business = await prisma.business.findFirst({
      where: { id: req.business.id }
    });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(convertDecimals(business));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// STAFF
// ------------------------------------------------------------------
app.get('/api/staff', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { businessId: req.business.id }
    });
    res.json(convertDecimals(staff));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.phone) {
      return res.status(400).json({ error: 'Missing required fields: name, email, phone' });
    }
    const newStaff = await prisma.staff.create({
      data: {
        id: req.body.id || `st-${Date.now()}`,
        businessId: req.business.id,
        name: req.body.name,
        role: req.body.role || 'Stylist',
        email: req.body.email,
        phone: req.body.phone,
        commission: req.body.commission || 15.0,
        rating: req.body.rating || 5.0,
        active: req.body.active !== undefined ? req.body.active : true,
        avatar: req.body.avatar
      }
    });
    res.json(convertDecimals(newStaff));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff/:id/status', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    if (req.body.active === undefined) {
      return res.status(400).json({ error: 'Missing active status' });
    }
    const staff = await prisma.staff.update({
      where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
      data: { active: req.body.active }
    });
    res.json(convertDecimals(staff));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// SERVICES
// ------------------------------------------------------------------
app.get('/api/services', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { businessId: req.business.id },
      include: {
        staffMembers: true
      }
    });
    const mapped = services.map(srv => {
      const { staffMembers, ...rest } = srv;
      return {
        ...rest,
        staffIds: staffMembers.map(sm => sm.staffId)
      };
    });
    res.json(convertDecimals(mapped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    if (!req.body.name || !req.body.category || req.body.duration === undefined || req.body.price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, category, duration, price' });
    }
    const { staffIds, ...rest } = req.body;
    const service = await prisma.service.create({
      data: {
        id: req.body.id || `srv-${Date.now()}`,
        businessId: req.business.id,
        category: req.body.category,
        name: req.body.name,
        duration: req.body.duration,
        price: req.body.price,
        buffer: req.body.buffer || 10,
        description: req.body.description,
        staffMembers: staffIds && staffIds.length > 0 ? {
          create: staffIds.map(staffId => ({
            businessId: req.business.id,
            staffId: staffId
          }))
        } : undefined
      },
      include: { staffMembers: true }
    });
    
    const mapped = {
      ...service,
      staffIds: service.staffMembers.map(sm => sm.staffId)
    };
    delete mapped.staffMembers;
    res.status(201).json(convertDecimals(mapped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Missing update data' });
    }
    const { staffIds, ...rest } = req.body;
    const service = await prisma.service.update({
      where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
      data: rest,
      include: { staffMembers: true }
    });
    const mapped = {
      ...service,
      staffIds: service.staffMembers.map(sm => sm.staffId)
    };
    delete mapped.staffMembers;
    res.json(convertDecimals(mapped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// CUSTOMERS
// ------------------------------------------------------------------
app.get('/api/customers', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { businessId: req.business.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(convertDecimals(customers));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    const cust = await prisma.customer.create({
      data: {
        id: req.body.id || `cust-${Date.now()}`,
        businessId: req.business.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        visits: req.body.visits || 0,
        totalSpend: req.body.totalSpend || 0.0,
        tag: req.body.tag ? req.body.tag.toUpperCase() : 'NEW',
        notes: req.body.notes
      }
    });
    res.status(201).json(convertDecimals(cust));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Missing update data' });
    }
    const data = { ...req.body };
    if (data.tag) data.tag = data.tag.toUpperCase();
    
    const cust = await prisma.customer.update({
      where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
      data
    });
    res.json(convertDecimals(cust));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// APPOINTMENTS
// ------------------------------------------------------------------
app.get('/api/availability', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    const { date, serviceId, staffId } = req.query;
    if (!date || !serviceId) return res.status(400).json({ error: 'Missing date or serviceId' });

    const business = await prisma.business.findUnique({ where: { id: req.business.id } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const service = await prisma.service.findUnique({
      where: { businessId_id: { businessId: req.business.id, id: serviceId } },
      include: { staffMembers: true }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    let targetStaffIds = [];
    if (staffId === 'any') {
      targetStaffIds = service.staffMembers.map(sm => sm.staffId);
    } else if (staffId) {
      const isAssigned = service.staffMembers.some(sm => sm.staffId === staffId);
      if (!isAssigned) return res.json([]);
      targetStaffIds = [staffId];
    } else {
      return res.status(400).json({ error: 'Missing staffId' });
    }

    if (targetStaffIds.length === 0) return res.json([]);

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = business.hours[dayOfWeek];
    if (!hours || hours.isClosed) return res.json([]);

    const dayStartStr = hours.open;
    const dayEndStr = hours.close;

    const slots = [];
    let currentSlot = parse(`${date} ${dayStartStr}`, 'yyyy-MM-dd HH:mm', new Date());
    const dayEnd = parse(`${date} ${dayEndStr}`, 'yyyy-MM-dd HH:mm', new Date());

    const { duration, buffer } = service;
    const totalDuration = duration + buffer;

    const startOfDayZoned = fromZonedTime(parse(`${date} 00:00`, 'yyyy-MM-dd HH:mm', new Date()), TIMEZONE);
    const endOfDayZoned = fromZonedTime(parse(`${date} 23:59`, 'yyyy-MM-dd HH:mm', new Date()), TIMEZONE);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        businessId: req.business.id,
        staffId: { in: targetStaffIds },
        startTime: { gte: startOfDayZoned },
        endTime: { lte: endOfDayZoned },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      },
      include: { service: true }
    });

    const nowZoned = new Date();
    
    while (isBefore(addMinutes(currentSlot, duration), dayEnd) || isEqual(addMinutes(currentSlot, duration), dayEnd)) {
      const currentSlotZoned = fromZonedTime(currentSlot, TIMEZONE);
      if (isBefore(currentSlotZoned, nowZoned)) {
        currentSlot = addMinutes(currentSlot, 15);
        continue;
      }

      const isAvailable = targetStaffIds.some(sid => {
        const staffApps = existingAppointments.filter(app => app.staffId === sid);
        const candidateStart = currentSlotZoned;
        const candidateEnd = addMinutes(candidateStart, totalDuration);

        const hasOverlap = staffApps.some(app => {
          const appStart = app.startTime;
          const appBuffer = app.service?.buffer || 0;
          const appEndWithBuffer = addMinutes(app.endTime, appBuffer);
          return candidateStart < appEndWithBuffer && candidateEnd > appStart;
        });

        return !hasOverlap;
      });

      if (isAvailable) {
        slots.push(format(currentSlot, 'hh:mm a'));
      }
      
      currentSlot = addMinutes(currentSlot, 15);
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appointments', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    const query = {
      where: { businessId: req.business.id },
      include: {
        customer: true,
        service: true,
        staff: true
      },
      orderBy: { startTime: 'desc' }
    };
    if (req.user.role === 'STAFF') {
      if (!req.user.staffId) return res.status(403).json({ error: 'STAFF role requires linked staff profile' });
      query.where.staffId = req.user.staffId;
    }
    const appointments = await prisma.appointment.findMany(query);
    
    const mapped = appointments.map(apt => {
      const zonedStart = toZonedTime(apt.startTime, TIMEZONE);
      const dateStr = format(zonedStart, 'yyyy-MM-dd');
      const timeStr = format(zonedStart, 'hh:mm a');
      
      return {
        id: apt.id,
        customerName: apt.customer?.name || 'Walk-in',
        customerId: apt.customerId,
        serviceName: apt.service?.name,
        serviceId: apt.serviceId,
        staffName: apt.staff?.name,
        staffId: apt.staffId,
        date: dateStr,
        time: timeStr,
        duration: apt.durationAtBooking,
        price: Number(apt.priceAtBooking),
        status: apt.status.toLowerCase().replace('_', '-'),
        notes: apt.notes
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/appointments', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    if (!req.body.serviceId || !req.body.staffId || !req.body.date || !req.body.time) {
      return res.status(400).json({ error: 'Missing required appointment fields' });
    }
    
    const service = await prisma.service.findUnique({
      where: { businessId_id: { businessId: req.business.id, id: req.body.serviceId } },
      include: { staffMembers: true }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    let targetStaffIds = [];
    if (req.body.staffId === 'any') {
      targetStaffIds = service.staffMembers.map(sm => sm.staffId);
    } else {
      targetStaffIds = [req.body.staffId];
    }

    const localDateTimeStr = `${req.body.date} ${req.body.time}`;
    const parsedTime = parse(localDateTimeStr, 'yyyy-MM-dd hh:mm a', new Date());
    if (isNaN(parsedTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date/time format' });
    }

    const startTime = fromZonedTime(parsedTime, TIMEZONE);
    const duration = req.body.duration || service.duration;
    const endTime = addMinutes(startTime, duration);
    const candidateEnd = addMinutes(startTime, duration + service.buffer);

    const apt = await prisma.$transaction(async (tx) => {
      let assignedStaffId = null;

      for (const sid of targetStaffIds) {
        const searchStart = addMinutes(startTime, -120);
        const searchEnd = candidateEnd;

        const overlaps = await tx.appointment.findMany({
          where: {
            businessId: req.business.id,
            staffId: sid,
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            startTime: { gte: searchStart },
            endTime: { lte: searchEnd }
          },
          include: { service: true }
        });

        const hasOverlap = overlaps.some(app => {
          const appStart = app.startTime;
          const appBuffer = app.service?.buffer || 0;
          const appEndWithBuffer = addMinutes(app.endTime, appBuffer);
          return startTime < appEndWithBuffer && candidateEnd > appStart;
        });

        if (!hasOverlap) {
          assignedStaffId = sid;
          break;
        }
      }

      if (!assignedStaffId) {
        throw new Error('SLOT_TAKEN');
      }

      return await tx.appointment.create({
        data: {
          id: req.body.id || `apt-${Date.now()}`,
          businessId: req.business.id,
          customerId: req.body.customerId,
          serviceId: req.body.serviceId,
          staffId: assignedStaffId,
          startTime,
          endTime,
          priceAtBooking: req.body.price || service.price,
          durationAtBooking: duration,
          status: 'CONFIRMED',
          notes: req.body.notes
        }
      });
    }, {
      isolationLevel: 'Serializable'
    });

    res.status(201).json(convertDecimals(apt));
  } catch (error) {
    if (error.message === 'SLOT_TAKEN') {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appointments/:id/status', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    if (req.user.role === 'STAFF') {
      // Check if it's their appointment
      if (!req.user.staffId) return res.status(403).json({ error: 'No staff profile linked' });
      const aptCheck = await prisma.appointment.findFirst({
        where: { businessId: req.business.id, id: req.params.id, staffId: req.user.staffId }
      });
      if (!aptCheck) return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }
    if (!req.body.status) {
      return res.status(400).json({ error: 'Missing status' });
    }
    const dbStatus = req.body.status.toUpperCase().replace('-', '_');
    const apt = await prisma.appointment.update({
      where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
      data: { status: dbStatus }
    });
    res.json(convertDecimals(apt));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// INVENTORY
// ------------------------------------------------------------------
app.get('/api/inventory', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    const inv = await prisma.inventoryItem.findMany({
      where: { businessId: req.business.id }
    });
    res.json(convertDecimals(inv));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    if (!req.body.name || req.body.price === undefined || req.body.cost === undefined) {
      return res.status(400).json({ error: 'Missing name, price, or cost' });
    }
    const inv = await prisma.inventoryItem.create({
      data: {
        id: req.body.id || `inv-${Date.now()}`,
        businessId: req.business.id,
        name: req.body.name,
        sku: req.body.sku || `SKU-${Date.now()}`,
        category: 'RETAIL',
        stock: req.body.stock || 0,
        minStock: req.body.minStock || 5,
        cost: req.body.cost,
        price: req.body.price,
        supplier: req.body.supplier
      }
    });
    res.status(201).json(convertDecimals(inv));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id/restock', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    const addedQty = Number(req.body.addedQty);
    if (isNaN(addedQty) || addedQty <= 0) {
      return res.status(400).json({ error: 'Invalid restock quantity' });
    }
    
    const inv = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryItem.update({
        where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
        data: {
          stock: { increment: addedQty }
        }
      });
      
      await tx.inventoryMovement.create({
        data: {
          businessId: req.business.id,
          inventoryItemId: req.params.id,
          type: 'RESTOCK',
          quantity: addedQty,
          reason: req.body.reason || 'Manual restock'
        }
      });
      
      return updated;
    }, { isolationLevel: 'Serializable' });

    res.json(convertDecimals(inv));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// ORDERS
// ------------------------------------------------------------------
app.get('/api/orders', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { businessId: req.business.id },
      include: {
        items: true,
        payments: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mapped = orders.map(o => ({
      id: o.id,
      customerName: o.customer?.name || o.customerName || 'Walk-in Client',
      items: o.items.map(i => ({ name: i.name, price: Number(i.unitPrice), qty: i.qty })),
      subtotal: Number(o.subtotal),
      tax: Number(o.tax),
      tip: Number(o.tip),
      total: Number(o.total),
      paymentMethod: o.payments.length > 0 ? o.payments[0].paymentMethod.replace('_', ' ') : 'Credit Card',
      status: o.status === 'COMPLETED' ? 'COMPLETED' : o.status,
      date: o.createdAt.toISOString().split('T')[0],
      time: o.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST', 'STAFF']), async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }
    
    // Validate quantities
    for (const item of orderData.items) {
      if (!item.qty || item.qty < 1) {
        return res.status(400).json({ error: `Invalid quantity for item: ${item.name}` });
      }
    }
    
    const orderId = orderData.id || `ORD-${Date.now()}`;
    
    const order = await prisma.$transaction(async (tx) => {
      // Step 1: Validate and lock inventory stock for all retail items
      const productItems = orderData.items.filter(i => i.type === 'Retail' && i.id);
      for (const item of productItems) {
        const invItem = await tx.inventoryItem.findUnique({
          where: { businessId_id: { businessId: req.business.id, id: item.id } }
        });
        if (!invItem) {
          throw new Error(`Inventory item not found: ${item.name}`);
        }
        if (invItem.stock < item.qty) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${invItem.stock}`);
        }
      }

      // Step 2: Deduct inventory stock
      for (const item of productItems) {
        await tx.inventoryItem.update({
          where: { businessId_id: { businessId: req.business.id, id: item.id } },
          data: { stock: { decrement: item.qty } }
        });
      }
      
      let paymentMethod = 'CREDIT_CARD';
      if (orderData.paymentMethod === 'Apple Pay') paymentMethod = 'APPLE_PAY';
      if (orderData.paymentMethod === 'Cash') paymentMethod = 'CASH';

      // Step 3: Create the order (with items and payments)
      const createdOrder = await tx.order.create({
        data: {
          id: orderId,
          businessId: req.business.id,
          customerName: orderData.customerName,
          subtotal: orderData.subtotal || 0,
          tax: orderData.tax || 0,
          tip: orderData.tip || 0,
          total: orderData.total || 0,
          status: 'COMPLETED',
          items: {
            create: orderData.items.map(i => {
              const data = {
                name: i.name,
                unitPrice: i.price,
                qty: i.qty,
                subtotal: (i.price * i.qty),
                itemType: 'CUSTOM'
              };
              if (i.type === 'Retail' && i.id) {
                data.itemType = 'PRODUCT';
                data.inventoryItemId = i.id;
              } else if (i.type === 'Service' && i.id) {
                data.itemType = 'SERVICE';
                data.serviceId = i.id;
              }
              return data;
            })
          },
          payments: {
            create: [{
              amount: orderData.total || 0,
              paymentMethod: paymentMethod,
              status: 'COMPLETED'
            }]
          }
        },
        include: { items: true, payments: true }
      });

      // Step 4: Create SALE movement records AFTER order exists (FK requirement)
      for (const item of productItems) {
        await tx.inventoryMovement.create({
          data: {
            businessId: req.business.id,
            inventoryItemId: item.id,
            orderId: createdOrder.id,
            type: 'SALE',
            quantity: -item.qty,
            reason: 'POS Sale'
          }
        });
      }
      
      return createdOrder;
    }, { isolationLevel: 'Serializable' });
    
    res.status(201).json({
      id: order.id,
      customerName: order.customerName,
      items: order.items.map(i => ({ name: i.name, price: Number(i.unitPrice), qty: i.qty })),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      tip: Number(order.tip),
      total: Number(order.total),
      paymentMethod: order.payments[0].paymentMethod.replace('_', ' '),
      status: 'Completed',
      date: order.createdAt.toISOString().split('T')[0],
      time: order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    });
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});




app.put('/api/orders/:id/refund', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
        include: { items: true, payments: true }
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.status === 'REFUNDED') {
        throw new Error('Order is already refunded');
      }
      
      if (order.status !== 'COMPLETED') {
        throw new Error(`Cannot refund order in status: ${order.status}`);
      }
      
      const updated = await tx.order.update({
        where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
        data: { status: 'REFUNDED' },
        include: { items: true, payments: true }
      });
      
      for (const payment of order.payments) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' }
        });
      }
      
      for (const item of order.items) {
        if (item.itemType === 'PRODUCT' && item.inventoryItemId) {
          await tx.inventoryItem.update({
            where: { businessId_id: { businessId: req.business.id, id: item.inventoryItemId } },
            data: { stock: { increment: item.qty } }
          });
          
          await tx.inventoryMovement.create({
            data: {
              businessId: req.business.id,
              inventoryItemId: item.inventoryItemId,
              orderId: order.id,
              type: 'REFUND',
              quantity: item.qty,
              reason: 'Order Refunded'
            }
          });
        }
      }
      
      return updated;
    }, { isolationLevel: 'Serializable' });
    
    res.json({
      id: updatedOrder.id,
      customerName: updatedOrder.customerName,
      items: updatedOrder.items.map(i => ({ name: i.name, price: Number(i.unitPrice), qty: i.qty })),
      subtotal: Number(updatedOrder.subtotal),
      tax: Number(updatedOrder.tax),
      tip: Number(updatedOrder.tip),
      total: Number(updatedOrder.total),
      paymentMethod: updatedOrder.payments.length > 0 ? updatedOrder.payments[0].paymentMethod.replace('_', ' ') : 'Credit Card',
      status: 'Refunded',
      date: updatedOrder.createdAt.toISOString().split('T')[0],
      time: updatedOrder.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    });
  } catch (error) {
    if (error.message.includes('already refunded') || error.message.includes('Cannot refund')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// INSIGHTS
// ------------------------------------------------------------------
app.get('/api/insights', authMiddleware, authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    const insights = await prisma.insight.findMany({
      where: { businessId: req.business.id }
    });
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------------
app.get('/api/notifications', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { businessId: req.business.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const mapped = notifs.map(n => ({
      id: n.id,
      recipient: n.recipient,
      channel: n.channel,
      type: n.type,
      message: n.message,
      time: 'Just now',
      status: n.status
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', authMiddleware, authorize(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req, res) => {
  try {
    if (!req.body.recipient || !req.body.channel || !req.body.message) {
      return res.status(400).json({ error: 'Missing recipient, channel, or message' });
    }
    const notif = await prisma.notification.create({
      data: {
        id: req.body.id || `notif-${Date.now()}`,
        businessId: req.business.id,
        recipient: req.body.recipient,
        channel: req.body.channel.toUpperCase() === 'SYSTEM' ? 'SYSTEM' : 'SMS',
        type: req.body.type || 'System Alert',
        message: req.body.message,
        status: 'DELIVERED'
      }
    });
    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// INTEGRATIONS
// ------------------------------------------------------------------
app.get('/api/integrations', authMiddleware, authorize(['OWNER']), async (req, res) => {
  try {
    const ints = await prisma.integration.findMany({
      where: { businessId: req.business.id }
    });
    
    const mapped = ints.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      status: i.status === 'CONNECTED' ? 'Connected' : 'Disconnected',
      icon: i.icon,
      description: i.description,
      lastSync: i.lastSync,
      keyPreview: i.keyPreview
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/integrations/:id/toggle', authMiddleware, authorize(['OWNER']), async (req, res) => {
  try {
    const current = await prisma.integration.findUnique({
      where: { businessId_id: { businessId: req.business.id, id: req.params.id } }
    });
    
    if (!current) return res.status(404).json({ error: 'Not found' });
    
    const newStatus = current.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    
    const updated = await prisma.integration.update({
      where: { businessId_id: { businessId: req.business.id, id: req.params.id } },
      data: { 
        status: newStatus,
        lastSync: newStatus === 'CONNECTED' ? 'Just now' : 'Paused'
      }
    });
    
    res.json({
      id: updated.id,
      name: updated.name,
      category: updated.category,
      status: updated.status === 'CONNECTED' ? 'Connected' : 'Disconnected',
      icon: updated.icon,
      description: updated.description,
      lastSync: updated.lastSync,
      keyPreview: updated.keyPreview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
