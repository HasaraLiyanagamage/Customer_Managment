const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { check } = require('express-validator');
const { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  deleteDocument
} = require('../controllers/customer.controller');
const { auth, authorize } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document and image files are allowed!'));
    }
  }
}).fields([
  { name: 'documents', maxCount: 5 },
  { name: 'profile_image', maxCount: 1 },
  { name: 'id_proof', maxCount: 2 },
  { name: 'business_documents', maxCount: 5 }
]);

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/customers
// @desc    Get all customers with pagination and search
// @access  Private
router.get('/', getCustomers);

// @route   GET /api/customers/:id
// @desc    Get single customer by ID
// @access  Private
router.get('/:id', getCustomerById);

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Private
router.post(
  '/',
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('business_name', 'Business name is required').not().isEmpty()
  ],
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  createCustomer
);

// @route   PUT /api/customers/:id
// @desc    Update a customer
// @access  Private
router.put(
  '/:id',
  [
    check('email', 'Please include a valid email').optional().isEmail(),
  ],
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  updateCustomer
);

// @route   DELETE /api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete('/:id', deleteCustomer);

// @route   DELETE /api/customers/documents/:id
// @desc    Delete a customer document
// @access  Private
router.delete('/documents/:id', deleteDocument);

module.exports = router;
