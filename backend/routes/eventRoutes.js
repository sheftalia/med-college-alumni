const express = require('express');
const { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin only routes
router.post('/', 
  authenticateToken, 
  checkRole(['admin']), 
  createEvent
);

router.put('/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  updateEvent
);

router.delete('/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  deleteEvent
);

module.exports = router;