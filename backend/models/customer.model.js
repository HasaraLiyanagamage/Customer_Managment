module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Sri Lanka'
    },
    business_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    business_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    business_reg_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tin_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    vat_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    activities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'customers',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeUpdate: (customer) => {
        customer.updated_at = new Date();
      }
    }
  });

  Customer.associate = (models) => {
    Customer.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Customer.hasMany(models.CustomerDocument, {
      foreignKey: 'customer_id',
      as: 'documents',
      onDelete: 'CASCADE'
    });
  };

  return Customer;
};
