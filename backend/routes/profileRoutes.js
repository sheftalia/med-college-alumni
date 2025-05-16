const express = require('express');
const {
  createProfile,
  updateProfile,
  getUserProfile,
  getSchoolsAndCourses
} = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Public routes for getting schools and courses
router.get('/schools-courses', getSchoolsAndCourses);

// Routes for authenticated users
router.get('/me', authenticateToken, getUserProfile);
router.post('/', 
  authenticateToken, 
  checkRole(['applied_alumni', 'registered_alumni', 'admin']), 
  createProfile
);
router.put('/:id', 
  authenticateToken, 
  checkRole(['registered_alumni', 'admin']), 
  updateProfile
);

module.exports = router;