import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')
  
  // Clean DB
  await prisma.serviceStaff.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.service.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.insight.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.integration.deleteMany()
  await prisma.user.deleteMany()
  await prisma.business.deleteMany()
  
  console.log('Cleared existing data.')

  // Seed Business
  const business = await prisma.business.create({
    data: {
      id: 'biz_default',
      name: 'Vanilla Spa & Salon',
      tagline: 'Boutique Wellness, Hair & Aesthetic Care',
      owner: 'Jane Doe',
      email: 'hello@vanillasalon.com',
      phone: '+1 (555) 382-9912',
      address: '142 Orchard Grove Blvd, Suite 200, Seattle, WA',
      currency: '$',
      taxRate: 0.0850,
      depositPercent: 20.00,
      cancellationHours: 24,
      hours: {
        monday: { open: "09:00", close: "19:00", isClosed: false },
        tuesday: { open: "09:00", close: "19:00", isClosed: false },
        wednesday: { open: "09:00", close: "19:00", isClosed: false },
        thursday: { open: "09:00", close: "20:00", isClosed: false },
        friday: { open: "09:00", close: "20:00", isClosed: false },
        saturday: { open: "10:00", close: "18:00", isClosed: false },
        sunday: { open: "10:00", close: "16:00", isClosed: false }
      }
    }
  })
  
  console.log('Created business')

  const staff1 = await prisma.staff.create({
    data: {
      id: 'st-1',
      businessId: 'biz_default',
      name: 'Sarah Jenkins',
      role: 'Senior Colorist',
      email: 'sarah@vanillasalon.com',
      phone: '555-0101',
      active: true,
      commission: 15.00,
      rating: 4.9
    }
  })
  
  const staff2 = await prisma.staff.create({
    data: {
      id: 'st-2',
      businessId: 'biz_default',
      name: 'Marcus Chen',
      role: 'Master Stylist',
      email: 'marcus@vanillasalon.com',
      phone: '555-0102',
      active: true,
      commission: 20.00,
      rating: 5.0
    }
  })

  const staff3 = await prisma.staff.create({
    data: {
      id: 'st-3',
      businessId: 'biz_default',
      name: 'Elena Rodriguez',
      role: 'Aesthetician',
      email: 'elena@vanillasalon.com',
      phone: '555-0103',
      active: true,
      commission: 15.00,
      rating: 4.8
    }
  })
  
  console.log('Created staff')

  await prisma.user.createMany({
    data: [
      {
        id: 'usr-owner',
        businessId: 'biz_default',
        name: 'Jane Doe',
        email: 'jane@vanillasalon.com',
        passwordHash: '$2b$10$dr72ihLzhj3eslPhovORwuCooCfR12K0yHWIizdUXDgP1hqkLAWh2',
        role: 'OWNER'
      },
      {
        id: 'usr-staff1',
        businessId: 'biz_default',
        staffId: 'st-1',
        name: 'Sarah Jenkins',
        email: 'sarah@vanillasalon.com',
        pinHash: '$2b$10$p4NC8wogAJia1DgEx1MuGeeKzYEK6v2oF/BJWvDGm38pDsQZPfX6q',
        role: 'STAFF'
      }
    ]
  })
  
  console.log('Created users')

  const srv1 = await prisma.service.create({
    data: {
      id: 'srv-1',
      businessId: 'biz_default',
      category: 'Hair',
      name: 'Balayage & Tone',
      duration: 180,
      price: 250.00,
      buffer: 15
    }
  })
  
  const srv2 = await prisma.service.create({
    data: {
      id: 'srv-2',
      businessId: 'biz_default',
      category: 'Hair',
      name: 'Women\'s Haircut',
      duration: 60,
      price: 85.00,
      buffer: 10
    }
  })
  
  const srv3 = await prisma.service.create({
    data: {
      id: 'srv-3',
      businessId: 'biz_default',
      category: 'Spa',
      name: 'Signature Facial',
      duration: 60,
      price: 120.00,
      buffer: 15
    }
  })
  
  await prisma.serviceStaff.createMany({
    data: [
      { businessId: 'biz_default', serviceId: 'srv-1', staffId: 'st-1' },
      { businessId: 'biz_default', serviceId: 'srv-2', staffId: 'st-1' },
      { businessId: 'biz_default', serviceId: 'srv-2', staffId: 'st-2' },
      { businessId: 'biz_default', serviceId: 'srv-3', staffId: 'st-3' },
    ]
  })
  
  console.log('Created services')

  await prisma.customer.createMany({
    data: [
      { id: 'cust-1', businessId: 'biz_default', name: 'Emily Thompson', phone: '555-1234', email: 'emily@example.com', visits: 12, totalSpend: 1450.00, tag: 'VIP' },
      { id: 'cust-2', businessId: 'biz_default', name: 'Jessica Miller', phone: '555-5678', email: 'jessica@example.com', visits: 3, totalSpend: 320.00, tag: 'LOYAL' },
      { id: 'cust-3', businessId: 'biz_default', name: 'Amanda Clarke', phone: '555-9012', email: 'amanda@example.com', visits: 1, totalSpend: 0, tag: 'NEW' }
    ]
  })
  
  console.log('Created customers')

  await prisma.inventoryItem.createMany({
    data: [
      { id: 'inv-1', businessId: 'biz_default', name: 'Olaplex No. 3', sku: 'OLP-003', category: 'RETAIL', stock: 24, price: 30.00, cost: 15.00 },
      { id: 'inv-2', businessId: 'biz_default', name: 'Moroccanoil Treatment', sku: 'MOR-001', category: 'RETAIL', stock: 12, price: 44.00, cost: 22.00 }
    ]
  })

  console.log('Created inventory')

  await prisma.appointment.createMany({
    data: [
      { id: 'apt-101', businessId: 'biz_default', customerId: 'cust-1', serviceId: 'srv-1', staffId: 'st-1', startTime: new Date('2026-09-11T10:00:00Z'), endTime: new Date('2026-09-11T12:00:00Z'), priceAtBooking: 185.00, durationAtBooking: 120, status: 'IN_SERVICE', notes: 'Balayage touch-up with ash glaze' }
    ]
  })

  await prisma.order.createMany({
    data: [
      { id: 'ORD-9021', businessId: 'biz_default', customerId: 'cust-1', subtotal: 175.00, tax: 14.88, tip: 35.00, total: 224.88, status: 'COMPLETED' }
    ]
  })

  await prisma.insight.createMany({
    data: [
      { id: 'ins-1', businessId: 'biz_default', title: 'Slow Tuesday Afternoon Opportunity', category: 'Revenue Optimization', impact: '+$420 / week', priority: 'HIGH', description: 'Tuesdays between 1:00 PM and 4:00 PM have an average 45% idle chair rate.', actionText: 'Launch Midweek Promo' }
    ]
  })

  await prisma.notification.createMany({
    data: [
      { id: 'notif-1', businessId: 'biz_default', recipient: 'Emily Thompson', channel: 'SMS', type: 'Appointment Reminder', message: 'Hi Emily, reminder of your appointment.', status: 'DELIVERED' }
    ]
  })

  await prisma.integration.createMany({
    data: [
      { id: 'int-stripe', businessId: 'biz_default', name: 'Stripe Terminal & Payments', category: 'Payment Processing', status: 'CONNECTED', icon: 'CreditCard', description: 'Process chip, contactless cards, Apple Pay & automatic daily payouts.', lastSync: 'Real-time' }
    ]
  })

  console.log('Database seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
