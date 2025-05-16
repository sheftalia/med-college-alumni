const { pool } = require('../config/database');

// Create alumni profile
async function createProfile(req, res) {
  const { 
    first_name, last_name, graduation_year, course_id,
    bio, current_position, company, contact_email,
    phone, linkedin, profile_picture
  } = req.body;
  
  // Basic validation
  if (!first_name || !last_name || !course_id) {
    return res.status(400).json({ 
      message: 'First name, last name, and course are required' 
    });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Check if profile already exists for this user
    const [existingProfiles] = await connection.query(
      'SELECT * FROM alumni_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (existingProfiles.length > 0) {
      connection.release();
      return res.status(409).json({ 
        message: 'Profile already exists for this user',
        profileId: existingProfiles[0].id
      });
    }
    
    // Create new profile
    const [result] = await connection.query(
      `INSERT INTO alumni_profiles (
        user_id, first_name, last_name, graduation_year, course_id,
        bio, current_position, company, contact_email, phone,
        linkedin, profile_picture
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, first_name, last_name, graduation_year, course_id,
        bio, current_position, company, contact_email, phone,
        linkedin, profile_picture
      ]
    );
    
    // If user created a profile, update their role to registered_alumni
    if (req.user.role === 'applied_alumni') {
      await connection.query(
        'UPDATE users SET role = ? WHERE id = ?',
        ['registered_alumni', req.user.id]
      );
    }
    
    connection.release();
    
    res.status(201).json({
      message: 'Profile created successfully',
      profileId: result.insertId
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Error creating profile' });
  }
}

// Update alumni profile
async function updateProfile(req, res) {
  const profileId = req.params.id;
  const { 
    first_name, last_name, graduation_year, course_id,
    bio, current_position, company, contact_email,
    phone, linkedin, profile_picture
  } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    // Check if profile exists and belongs to the user
    const [profiles] = await connection.query(
      'SELECT * FROM alumni_profiles WHERE id = ?',
      [profileId]
    );
    
    if (profiles.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const profile = profiles[0];
    
    // Check if the profile belongs to the user or user is admin
    if (profile.user_id !== req.user.id && req.user.role !== 'admin') {
      connection.release();
      return res.status(403).json({ 
        message: 'You do not have permission to update this profile' 
      });
    }
    
    // Update profile
    await connection.query(
      `UPDATE alumni_profiles SET
        first_name = ?,
        last_name = ?,
        graduation_year = ?,
        course_id = ?,
        bio = ?,
        current_position = ?,
        company = ?,
        contact_email = ?,
        phone = ?,
        linkedin = ?,
        profile_picture = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        first_name || profile.first_name,
        last_name || profile.last_name,
        graduation_year || profile.graduation_year,
        course_id || profile.course_id,
        bio !== undefined ? bio : profile.bio,
        current_position !== undefined ? current_position : profile.current_position,
        company !== undefined ? company : profile.company,
        contact_email || profile.contact_email,
        phone !== undefined ? phone : profile.phone,
        linkedin !== undefined ? linkedin : profile.linkedin,
        profile_picture !== undefined ? profile_picture : profile.profile_picture,
        profileId
      ]
    );
    
    connection.release();
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
}

// Get user's own profile
async function getUserProfile(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [profiles] = await connection.query(
      `SELECT ap.*, c.name as course_name, s.name as school_name 
       FROM alumni_profiles ap
       JOIN courses c ON ap.course_id = c.id
       JOIN schools s ON c.school_id = s.id
       WHERE ap.user_id = ?`,
      [req.user.id]
    );
    
    connection.release();
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ profile: profiles[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
}

// Get schools and courses
async function getSchoolsAndCourses(req, res) {
  try {
    const connection = await pool.getConnection();
    
    // Get all schools
    const [schools] = await connection.query(
      'SELECT * FROM schools ORDER BY name'
    );
    
    // Get all courses
    const [courses] = await connection.query(
      'SELECT c.*, s.name as school_name FROM courses c JOIN schools s ON c.school_id = s.id ORDER BY s.name, c.name'
    );
    
    connection.release();
    
    res.json({ schools, courses });
  } catch (error) {
    console.error('Error fetching schools and courses:', error);
    res.status(500).json({ message: 'Error fetching schools and courses' });
  }
}

module.exports = {
  createProfile,
  updateProfile,
  getUserProfile,
  getSchoolsAndCourses
};
