const { Sequelize } = require('sequelize');
const { dbConfig } = require('../config/db.config');
const Role = require('./role.model');
const User = require('./user.model');
const Customer = require('./customer.model');
const CustomerDocument = require('./customerDocument.model');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {
  sequelize,
  Sequelize,
  Role: Role(sequelize, Sequelize),
  User: User(sequelize, Sequelize),
  Customer: Customer(sequelize, Sequelize),
  CustomerDocument: CustomerDocument(sequelize, Sequelize)
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
