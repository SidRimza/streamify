const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  approveUser,
  extendSubscription,
  updateExpiryDate,
  deactivateUser,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/extend', [
  body('days').optional().isInt({ min: 1 }).withMessage('Days must be a positive number')
], validate, extendSubscription);
router.put('/users/:id/expiry', [
  body('expiryDate').notEmpty().isISO8601().withMessage('Valid expiry date is required')
], validate, updateExpiryDate);
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
