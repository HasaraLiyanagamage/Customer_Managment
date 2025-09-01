const { Customer, CustomerDocument, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { business_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    // If user is not admin, only show their own customers
    if (req.user.role.name !== 'admin') {
      whereClause.created_by = req.user.id;
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      attributes: { 
        exclude: ['created_by'] 
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      customers
    });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ message: 'Server error while fetching customers' });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: CustomerDocument,
          as: 'documents',
          attributes: ['id', 'document_type', 'file_name', 'file_size', 'file_type', 'uploaded_at']
        }
      ],
      attributes: { exclude: ['created_by'] }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if user has permission to view this customer
    if (req.user.role.name !== 'admin' && customer.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this customer' });
    }

    res.json(customer);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ message: 'Server error while fetching customer' });
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country = 'Sri Lanka',
      business_name,
      business_type,
      business_reg_number,
      tin_number,
      vat_number,
      activities
    } = req.body;

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    // Create customer
    const customer = await Customer.create({
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      business_name,
      business_type,
      business_reg_number,
      tin_number,
      vat_number,
      activities,
      created_by: req.user.id
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const documents = [];
      
      for (const file of req.files) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadDir, uniqueName);
        
        // Move file to uploads directory
        await fs.promises.rename(file.path, filePath);
        
        // Create document record
        documents.push({
          customer_id: customer.id,
          document_type: file.fieldname || 'general',
          file_path: `/uploads/${uniqueName}`,
          file_name: file.originalname,
          file_size: file.size,
          file_type: file.mimetype
        });
      }
      
      if (documents.length > 0) {
        await CustomerDocument.bulkCreate(documents);
      }
    }

    const newCustomer = await Customer.findByPk(customer.id, {
      include: [
        {
          model: CustomerDocument,
          as: 'documents'
        }
      ]
    });

    res.status(201).json(newCustomer);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Server error while creating customer' });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if user has permission to update this customer
    if (req.user.role.name !== 'admin' && customer.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this customer' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      business_name,
      business_type,
      business_reg_number,
      tin_number,
      vat_number,
      activities
    } = req.body;

    // Check if email is being updated and if it's already taken
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email } });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already in use by another customer' });
      }
    }

    // Update customer
    await customer.update({
      first_name: first_name || customer.first_name,
      last_name: last_name || customer.last_name,
      email: email || customer.email,
      phone: phone || customer.phone,
      address: address !== undefined ? address : customer.address,
      city: city !== undefined ? city : customer.city,
      state: state !== undefined ? state : customer.state,
      postal_code: postal_code !== undefined ? postal_code : customer.postal_code,
      country: country || customer.country,
      business_name: business_name || customer.business_name,
      business_type: business_type !== undefined ? business_type : customer.business_type,
      business_reg_number: business_reg_number !== undefined ? business_reg_number : customer.business_reg_number,
      tin_number: tin_number !== undefined ? tin_number : customer.tin_number,
      vat_number: vat_number !== undefined ? vat_number : customer.vat_number,
      activities: activities !== undefined ? activities : customer.activities
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const documents = [];
      
      for (const file of req.files) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadDir, uniqueName);
        
        // Move file to uploads directory
        await fs.promises.rename(file.path, filePath);
        
        // Create document record
        documents.push({
          customer_id: customer.id,
          document_type: file.fieldname || 'general',
          file_path: `/uploads/${uniqueName}`,
          file_name: file.originalname,
          file_size: file.size,
          file_type: file.mimetype
        });
      }
      
      if (documents.length > 0) {
        await CustomerDocument.bulkCreate(documents);
      }
    }

    const updatedCustomer = await Customer.findByPk(customer.id, {
      include: [
        {
          model: CustomerDocument,
          as: 'documents'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(updatedCustomer);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ message: 'Server error while updating customer' });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if user has permission to delete this customer
    if (req.user.role.name !== 'admin' && customer.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this customer' });
    }

    // Delete associated documents
    const documents = await CustomerDocument.findAll({ 
      where: { customer_id: customer.id } 
    });

    // Delete files from filesystem
    for (const doc of documents) {
      const filePath = path.join(__dirname, '../../public', doc.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete customer (this will cascade delete documents due to foreign key constraint)
    await customer.destroy();

    res.json({ message: 'Customer removed' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ message: 'Server error while deleting customer' });
  }
};

// @desc    Delete a customer document
// @route   DELETE /api/customers/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await CustomerDocument.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has permission to delete this document
    if (req.user.role.name !== 'admin' && document.customer.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../public', document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document record
    await document.destroy();

    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ message: 'Server error while deleting document' });
  }
};
