const express = require('express');
const { body } = require('express-validator');
const {
  getStreams,
  getStream,
  createStream,
  updateStream,
  deleteStream,
  getLiveStreamsPublic
} = require('../controllers/streamController');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public route
router.get('/public/live', getLiveStreamsPublic);

// Protected routes
router.use(protect);

router.get('/', checkSubscription, getStreams);
router.get('/:id', checkSubscription, getStream);

// Admin only routes
router.post('/', authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('streamUrl').notEmpty().withMessage('Stream URL is required')
], validate, createStream);

router.put('/:id', authorize('admin'), updateStream);
router.delete('/:id', authorize('admin'), deleteStream);

module.exports = router;
