const express = require('express');
const { 
  getAllAlumni, 
  getAlumniById, 
  updateAlumniRole,
  deleteAlumni 
} = require('../controllers/alumniController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Routes accessible to all authenticated users
router.get('/', authenticateToken, getAllAlumni);
router.get('/:id', authenticateToken, getAlumniById);

// Admin-only routes
router.put('/role', 
  authenticateToken, 
  checkRole(['admin']), 
  updateAlumniRole
);

// Add the delete route for admins
router.delete('/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  deleteAlumni
);

module.exports = router;