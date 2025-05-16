const express = require('express');
const { 
  getUserMessages, 
  getSentMessages,
  sendMessage, 
  markAsRead 
} = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// All routes are protected
router.get('/', 
  authenticateToken, 
  checkRole(['admin', 'registered_alumni']), 
  getUserMessages
);

router.get('/sent', 
  authenticateToken, 
  checkRole(['admin', 'registered_alumni']), 
  getSentMessages
);

router.post('/', 
  authenticateToken, 
  checkRole(['admin', 'registered_alumni']), 
  sendMessage
);

router.put('/:id/read', 
  authenticateToken, 
  checkRole(['admin', 'registered_alumni']), 
  markAsRead
);

module.exports = router;