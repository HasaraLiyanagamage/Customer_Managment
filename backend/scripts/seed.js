const { sequelize } = require('../models');
const { Role, User, Customer, CustomerDocument } = require('../models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample data
const roles = [
  { name: 'admin', description: 'Administrator with full access' },
  { name: 'manager', description: 'Manager with limited admin access' },
  { name: 'user', description: 'Regular user with basic access' },
];

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'admin123',
    roleName: 'admin',
    isActive: true,
  },
  {
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@example.com',
    password: 'manager123',
    roleName: 'manager',
    isActive: true,
  },
  {
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@example.com',
    password: 'user123',
    roleName: 'user',
    isActive: true,
  },
];

const customers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    status: 'active',
    notes: 'Premium customer',
    createdById: 1,
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    country: 'USA',
    status: 'active',
    notes: 'New customer',
    createdById: 2,
  },
];

const customerDocuments = [
  {
    name: 'Contract',
    filePath: '/documents/contract.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1024, // 1MB
    customerId: 1,
    uploadedById: 1,
  },
  {
    name: 'ID Proof',
    filePath: '/documents/id_proof.jpg',
    fileType: 'image/jpeg',
    fileSize: 512 * 1024, // 512KB
    customerId: 1,
    uploadedById: 1,
  },
];

const seedDatabase = async () => {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    logger.info('Database synced');

    // Create roles
    const createdRoles = await Role.bulkCreate(roles);
    logger.info('Roles created');

    // Create users with hashed passwords
    for (const user of users) {
      const role = createdRoles.find(r => r.name === user.roleName);
      if (!role) {
        throw new Error(`Role ${user.roleName} not found`);
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        ...user,
        password: hashedPassword,
        roleId: role.id,
      });
    }
    logger.info('Users created');

    // Create customers
    const createdCustomers = await Customer.bulkCreate(customers);
    logger.info('Customers created');

    // Create customer documents
    await CustomerDocument.bulkCreate(customerDocuments);
    logger.info('Customer documents created');

    logger.info('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
