require('dotenv').config();
const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
  try {
    // Read the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, '../../database/schema.sql'), 
      'utf8'
    );

    // Execute the SQL commands
    await sequelize.query(sql);
    
    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

runMigrations();
