const { sequelize } = require('../models');
const { logger } = require('../utils/logger');

const dropDatabase = async () => {
  try {
    // Drop all tables
    await sequelize.drop();
    logger.info('Database dropped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error dropping database:', error);
    process.exit(1);
  }
};

// Run the script
dropDatabase();
