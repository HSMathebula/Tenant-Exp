import mongoose from "mongoose"
import dotenv from "dotenv"
import User, { UserRole } from "../models/User.model"
import Property from "../models/Property.model"
import Unit, { UnitStatus } from "../models/Unit.model"
import Tenant from "../models/Tenant.model"
import MaintenanceStaff from "../models/MaintenanceStaff.model"
import Ticket, { TicketCategory, TicketPriority, TicketStatus } from "../models/Ticket.model"
import Announcement from "../models/Announcement.model"
import InventoryItem from "../models/InventoryItem.model"
import VisitorAccess from "../models/VisitorAccess.model"
import Payment, { PaymentMethod, PaymentStatus, PaymentType } from "../models/Payment.model"

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB")
    seedDatabase()
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

async function seedDatabase() {
  try {
    // Clear existing data
    await clearDatabase()
    console.log("Database cleared")

    // Create users
    const users = await createUsers()
    console.log(`Created ${users.length} users`)

    // Create properties
    const properties = await createProperties(users.find((u) => u.role === UserRole.ADMIN)?._id)
    console.log(`Created ${properties.length} properties`)

    // Create units
    const units = await createUnits(properties)
    console.log(`Created ${units.length} units`)

    // Create tenants
    const tenants = await createTenants(
      users.filter((u) => u.role === UserRole.TENANT),
      units,
    )
    console.log(`Created ${tenants.length} tenants`)

    // Create maintenance staff
    const maintenanceStaff = await createMaintenanceStaff(
      users.filter((u) => u.role === UserRole.MAINTENANCE),
      properties,
    )
    console.log(`Created ${maintenanceStaff.length} maintenance staff`)

    // Create tickets
    const tickets = await createTickets(tenants, properties, units, maintenanceStaff)
    console.log(`Created ${tickets.length} tickets`)

    // Create announcements
    const announcements = await createAnnouncements(users.find((u) => u.role === UserRole.ADMIN)?._id, properties)
    console.log(`Created ${announcements.length} announcements`)

    // Create inventory items
    const inventoryItems = await createInventoryItems()
    console.log(`Created ${inventoryItems.length} inventory items`)

    // Create visitor access
    const visitorAccess = await createVisitorAccess(tenants, properties, units)
    console.log(`Created ${visitorAccess.length} visitor access codes`)

    // Create payments
    const payments = await createPayments(tenants, properties, units)
    console.log(`Created ${payments.length} payments`)

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

async function clearDatabase() {
  await User.deleteMany({})
  await Property.deleteMany({})
  await Unit.deleteMany({})
  await Tenant.deleteMany({})
  await MaintenanceStaff.deleteMany({})
  await Ticket.deleteMany({})
  await Announcement.deleteMany({})
  await InventoryItem.deleteMany({})
  await VisitorAccess.deleteMany({})
  await Payment.deleteMany({})
}

async function createUsers() {
  const users = [
    // Admin
    {
      email: "admin@propertypulse.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      phone: "555-123-4567",
      isActive: true,
    },
    // Tenants
    {
      email: "john.doe@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: UserRole.TENANT,
      phone: "555-111-2222",
      isActive: true,
    },
    {
      email: "jane.smith@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Smith",
      role: UserRole.TENANT,
      phone: "555-222-3333",
      isActive: true,
    },
    {
      email: "michael.johnson@example.com",
      password: "password123",
      firstName: "Michael",
      lastName: "Johnson",
      role: UserRole.TENANT,
      phone: "555-333-4444",
      isActive: true,
    },
    {
      email: "sarah.williams@example.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Williams",
      role: UserRole.TENANT,
      phone: "555-444-5555",
      isActive: true,
    },
    // Maintenance Staff
    {
      email: "bob.builder@example.com",
      password: "password123",
      firstName: "Bob",
      lastName: "Builder",
      role: UserRole.MAINTENANCE,
      phone: "555-555-6666",
      isActive: true,
    },
    {
      email: "alice.plumber@example.com",
      password: "password123",
      firstName: "Alice",
      lastName: "Plumber",
      role: UserRole.MAINTENANCE,
      phone: "555-666-7777",
      isActive: true,
    },
  ]

  return await User.insertMany(users)
}

async function createProperties(adminId: mongoose.Types.ObjectId) {
  const properties = [
    {
      name: "Sunset Apartments",
      address: {
        street: "123 Sunset Blvd",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
      },
      totalUnits: 20,
      manager: adminId,
      description: "Modern apartment complex with pool and fitness center",
      amenities: ["Pool", "Fitness Center", "Covered Parking", "Pet Friendly"],
      isActive: true,
    },
    {
      name: "Mountain View Residences",
      address: {
        street: "456 Mountain Rd",
        city: "Denver",
        state: "CO",
        zipCode: "80201",
        country: "USA",
      },
      totalUnits: 15,
      manager: adminId,
      description: "Cozy apartments with beautiful mountain views",
      amenities: ["Balcony", "Fireplace", "Ski Storage", "Hiking Trails"],
      isActive: true,
    },
    {
      name: "Urban Lofts",
      address: {
        street: "789 Downtown Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
      totalUnits: 30,
      manager: adminId,
      description: "Modern lofts in the heart of downtown",
      amenities: ["Rooftop Deck", "24/7 Security", "Bike Storage", "Co-working Space"],
      isActive: true,
    },
  ]

  return await Property.insertMany(properties)
}

async function createUnits(properties: any[]) {
  const units = []

  // Sunset Apartments units
  for (let i = 1; i <= 5; i++) {
    units.push({
      property: properties[0]._id,
      unitNumber: `A${i}`,
      floor: 1,
      bedrooms: i % 3 === 0 ? 2 : 1,
      bathrooms: i % 3 === 0 ? 2 : 1,
      squareFootage: i % 3 === 0 ? 900 : 700,
      rent: i % 3 === 0 ? 1500 : 1200,
      status: i <= 3 ? UnitStatus.OCCUPIED : UnitStatus.VACANT,
      features: ["Dishwasher", "Air Conditioning", "Hardwood Floors"],
    })
  }

  // Mountain View Residences units
  for (let i = 1; i <= 5; i++) {
    units.push({
      property: properties[1]._id,
      unitNumber: `B${i}`,
      floor: 2,
      bedrooms: i % 2 === 0 ? 2 : 1,
      bathrooms: i % 2 === 0 ? 2 : 1,
      squareFootage: i % 2 === 0 ? 950 : 750,
      rent: i % 2 === 0 ? 1600 : 1300,
      status: i <= 3 ? UnitStatus.OCCUPIED : UnitStatus.VACANT,
      features: ["Mountain View", "Fireplace", "Updated Kitchen"],
    })
  }

  // Urban Lofts units
  for (let i = 1; i <= 5; i++) {
    units.push({
      property: properties[2]._id,
      unitNumber: `C${i}`,
      floor: 3,
      bedrooms: i % 2 === 0 ? 2 : 1,
      bathrooms: i % 2 === 0 ? 2 : 1,
      squareFootage: i % 2 === 0 ? 1000 : 800,
      rent: i % 2 === 0 ? 1800 : 1500,
      status: i <= 3 ? UnitStatus.OCCUPIED : UnitStatus.VACANT,
      features: ["High Ceilings", "Exposed Brick", "Stainless Steel Appliances"],
    })
  }

  return await Unit.insertMany(units)
}

async function createTenants(tenantUsers: any[], units: any[]) {
  const tenants = []

  // Match each tenant user with an occupied unit
  const occupiedUnits = units.filter((unit) => unit.status === UnitStatus.OCCUPIED)

  for (let i = 0; i < Math.min(tenantUsers.length, occupiedUnits.length); i++) {
    const now = new Date()
    const leaseStart = new Date(now.setMonth(now.getMonth() - 3))
    const leaseEnd = new Date(now.setMonth(now.getMonth() + 9))

    tenants.push({
      user: tenantUsers[i]._id,
      unit: occupiedUnits[i]._id,
      leaseStart,
      leaseEnd,
      rentAmount: occupiedUnits[i].rent,
      securityDeposit: occupiedUnits[i].rent,
      occupants: 1 + (i % 2), // 1 or 2 occupants
      emergencyContact: {
        name: "Emergency Contact",
        relationship: "Family",
        phone: "555-999-8888",
      },
      isActive: true,
    })
  }

  return await Tenant.insertMany(tenants)
}

async function createMaintenanceStaff(maintenanceUsers: any[], properties: any[]) {
  const maintenanceStaff = []

  for (let i = 0; i < maintenanceUsers.length; i++) {
    // Assign each maintenance staff to all properties for simplicity
    maintenanceStaff.push({
      user: maintenanceUsers[i]._id,
      properties: properties.map((p) => p._id),
      specialties: ["Plumbing", "Electrical", "General Maintenance"],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: i === 0, // First maintenance person works Saturdays
        sunday: false,
      },
      workingHours: {
        start: "09:00",
        end: "17:00",
      },
      isActive: true,
    })
  }

  return await MaintenanceStaff.insertMany(maintenanceStaff)
}

async function createTickets(tenants: any[], properties: any[], units: any[], maintenanceStaff: any[]) {
  const tickets = []
  const categories = Object.values(TicketCategory)
  const priorities = Object.values(TicketPriority)
  const statuses = Object.values(TicketStatus)

  for (let i = 0; i < tenants.length; i++) {
    // Create 2 tickets per tenant
    for (let j = 0; j < 2; j++) {
      const tenant = tenants[i]
      const unit = units.find((u) => u._id.toString() === tenant.unit.toString())
      const property = properties.find((p) => p._id.toString() === unit.property.toString())

      // Randomly assign maintenance staff
      const assignedTo = j % 2 === 0 ? maintenanceStaff[0].user : maintenanceStaff[maintenanceStaff.length - 1].user

      // Set status based on index
      const status = statuses[j % statuses.length]

      // Set dates based on status
      const now = new Date()
      const scheduledDate = status !== TicketStatus.PENDING ? new Date(now.setDate(now.getDate() + 2)) : undefined
      const completedDate = status === TicketStatus.COMPLETED ? new Date() : undefined

      tickets.push({
        tenant: tenant.user,
        property: property._id,
        unit: unit._id,
        category: categories[Math.floor(Math.random() * categories.length)],
        title: `Issue with ${j === 0 ? "plumbing" : "electrical"} in unit ${unit.unitNumber}`,
        description: `I have a ${j === 0 ? "leak under the sink" : "light fixture that keeps flickering"}. Please fix it as soon as possible.`,
        priority: priorities[j % priorities.length],
        status,
        assignedTo: status !== TicketStatus.PENDING ? assignedTo : undefined,
        scheduledDate,
        completedDate,
        accessInstructions: "Please knock before entering. Door code is 1234.",
        notes:
          status !== TicketStatus.PENDING
            ? [
                {
                  user: assignedTo,
                  text: "I'll check this out tomorrow.",
                  createdAt: new Date(now.setDate(now.getDate() - 1)),
                },
              ]
            : [],
      })
    }
  }

  return await Ticket.insertMany(tickets)
}

async function createAnnouncements(adminId: mongoose.Types.ObjectId, properties: any[]) {
  const announcements = []
  const now = new Date()

  for (let i = 0; i < properties.length; i++) {
    // Regular announcement
    announcements.push({
      title: `Monthly Newsletter - ${new Date().toLocaleString("default", { month: "long" })}`,
      content:
        "Please be informed that we will be conducting routine maintenance on the building's water system next week. Water will be shut off from 10 AM to 2 PM on Tuesday.",
      property: properties[i]._id,
      createdBy: adminId,
      startDate: new Date(),
      endDate: new Date(now.setDate(now.getDate() + 30)),
      isUrgent: false,
    })

    // Urgent announcement
    announcements.push({
      title: "Important: Parking Lot Closure",
      content:
        "Due to repaving, the main parking lot will be closed this weekend. Please use street parking or the guest lot.",
      property: properties[i]._id,
      createdBy: adminId,
      startDate: new Date(),
      endDate: new Date(now.setDate(now.getDate() + 7)),
      isUrgent: true,
    })
  }

  return await Announcement.insertMany(announcements)
}

async function createInventoryItems() {
  const inventoryItems = [
    {
      name: "Light Bulbs (60W)",
      category: "Electrical",
      description: "Standard 60W light bulbs",
      quantity: 50,
      unit: "each",
      minQuantity: 20,
      cost: 1.99,
      supplier: "Home Depot",
      location: "Storage Room A",
    },
    {
      name: "Light Bulbs (LED)",
      category: "Electrical",
      description: "Energy efficient LED bulbs",
      quantity: 30,
      unit: "each",
      minQuantity: 15,
      cost: 3.99,
      supplier: "Home Depot",
      location: "Storage Room A",
    },
    {
      name: "Faucet Washers",
      category: "Plumbing",
      description: "Standard faucet washers",
      quantity: 100,
      unit: "each",
      minQuantity: 40,
      cost: 0.5,
      supplier: "Plumbing Supply Co",
      location: "Storage Room B",
    },
    {
      name: "Air Filters (HVAC)",
      category: "HVAC",
      description: "Standard HVAC filters",
      quantity: 25,
      unit: "each",
      minQuantity: 10,
      cost: 12.99,
      supplier: "HVAC Supplies Inc",
      location: "Storage Room B",
    },
    {
      name: "Paint (White)",
      category: "Painting",
      description: "Standard white interior paint",
      quantity: 10,
      unit: "gallon",
      minQuantity: 5,
      cost: 24.99,
      supplier: "Sherwin Williams",
      location: "Storage Room C",
    },
    {
      name: "Toilet Flapper",
      category: "Plumbing",
      description: "Universal toilet flapper",
      quantity: 15,
      unit: "each",
      minQuantity: 5,
      cost: 5.99,
      supplier: "Plumbing Supply Co",
      location: "Storage Room B",
    },
    {
      name: "Smoke Detector",
      category: "Safety",
      description: "Battery operated smoke detector",
      quantity: 12,
      unit: "each",
      minQuantity: 5,
      cost: 19.99,
      supplier: "Home Depot",
      location: "Storage Room A",
    },
  ]

  return await InventoryItem.insertMany(inventoryItems)
}

async function createVisitorAccess(tenants: any[], properties: any[], units: any[]) {
  const visitorAccess = []
  const now = new Date()

  for (let i = 0; i < tenants.length; i++) {
    const tenant = tenants[i]
    const unit = units.find((u) => u._id.toString() === tenant.unit.toString())
    const property = properties.find((p) => p._id.toString() === unit.property.toString())

    // One-time visitor
    visitorAccess.push({
      tenant: tenant.user,
      property: property._id,
      unit: unit._id,
      visitorName: "John Friend",
      accessCode: "ABC123",
      validFrom: new Date(),
      validUntil: new Date(now.setDate(now.getDate() + 1)),
      isOneTime: true,
      isUsed: false,
    })

    // Recurring visitor (e.g., cleaning service)
    visitorAccess.push({
      tenant: tenant.user,
      property: property._id,
      unit: unit._id,
      visitorName: "Cleaning Service",
      accessCode: "XYZ789",
      validFrom: new Date(),
      validUntil: new Date(now.setMonth(now.getMonth() + 3)),
      isOneTime: false,
      isUsed: false,
      notes: "Weekly cleaning service, every Friday morning",
    })
  }

  return await VisitorAccess.insertMany(visitorAccess)
}

async function createPayments(tenants: any[], properties: any[], units: any[]) {
  const payments = []
  const now = new Date()
  const paymentTypes = Object.values(PaymentType)
  const paymentMethods = Object.values(PaymentMethod)

  for (let i = 0; i < tenants.length; i++) {
    const tenant = tenants[i]
    const unit = units.find((u) => u._id.toString() === tenant.unit.toString())
    const property = properties.find((p) => p._id.toString() === unit.property.toString())

    // Current month rent (paid)
    payments.push({
      tenant: tenant.user,
      property: property._id,
      unit: unit._id,
      amount: tenant.rentAmount,
      type: PaymentType.RENT,
      status: PaymentStatus.COMPLETED,
      method: paymentMethods[i % paymentMethods.length],
      dueDate: new Date(now.getFullYear(), now.getMonth(), 1),
      paidDate: new Date(now.getFullYear(), now.getMonth(), 3),
      transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`,
    })

    // Security deposit (paid)
    payments.push({
      tenant: tenant.user,
      property: property._id,
      unit: unit._id,
      amount: tenant.securityDeposit,
      type: PaymentType.SECURITY_DEPOSIT,
      status: PaymentStatus.COMPLETED,
      method: paymentMethods[i % paymentMethods.length],
      paidDate: new Date(now.getFullYear(), now.getMonth() - 3, 15),
      transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`,
    })

    // Next month rent (pending)
    payments.push({
      tenant: tenant.user,
      property: property._id,
      unit: unit._id,
      amount: tenant.rentAmount,
      type: PaymentType.RENT,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.BANK_TRANSFER,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    })

    // Maintenance fee (if applicable)
    if (i % 2 === 0) {
      payments.push({
        tenant: tenant.user,
        property: property._id,
        unit: unit._id,
        amount: 50,
        type: PaymentType.MAINTENANCE_FEE,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.CREDIT_CARD,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        notes: "Fee for after-hours maintenance call",
      })
    }
  }

  return await Payment.insertMany(payments)
}
