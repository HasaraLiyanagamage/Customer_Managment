const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Import models
const Role = require('../models/role.model')(sequelize, DataTypes);
const User = require('../models/user.model')(sequelize, DataTypes);
const Customer = require('../models/customer.model')(sequelize, DataTypes);
const CustomerDocument = require('../models/customerDocument.model')(sequelize, DataTypes);

// Define relationships
const defineRelationships = () => {
  // User - Role relationship
  User.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
  });

  // Customer - User relationship (createdBy)
  Customer.belongsTo(User, {
    foreignKey: 'createdById',
    as: 'createdBy'
  });

  // Customer - Documents relationship
  Customer.hasMany(CustomerDocument, {
    foreignKey: 'customerId',
    as: 'documents'
  });
  
  CustomerDocument.belongsTo(Customer, {
    foreignKey: 'customerId',
    as: 'customer'
  });
};

// Initialize the database
const initDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Define relationships
    defineRelationships();

    // Sync all models
    await sequelize.sync({ force: true });
    logger.info('Database synchronized');

    // Create default roles
    await createDefaultRoles();
    logger.info('Default roles created');

    // Create admin user if not exists
    await createAdminUser();
    logger.info('Admin user created');

    logger.info('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Create default roles
const createDefaultRoles = async () => {
  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'manager', description: 'Manager with limited admin access' },
    { name: 'user', description: 'Regular user with basic access' }
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { name: role.name },
      defaults: role
    });
  }
};

// Create admin user
const createAdminUser = async () => {
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  
  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  const [adminUser, created] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123', // In production, this should be hashed
      roleId: adminRole.id,
      isActive: true
    }
  });

  if (created) {
    logger.info('Default admin user created');
  } else {
    logger.info('Admin user already exists');
  }
};

// Run the initialization
initDatabase();
