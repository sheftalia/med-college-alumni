const { pool } = require('../config/database');

// Get all alumni profiles (with filtering options)
async function getAllAlumni(req, res) {
  try {
    const connection = await pool.getConnection();
    
    // Extract filter parameters
    const { school, course, graduationYear, name } = req.query;
    
    let query = `
      SELECT ap.*, u.email, u.role, c.name as course_name, s.name as school_name 
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      JOIN courses c ON ap.course_id = c.id
      JOIN schools s ON c.school_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters if provided
    if (school) {
      query += ' AND s.id = ?';
      params.push(school);
    }
    
    if (course) {
      query += ' AND c.id = ?';
      params.push(course);
    }
    
    if (graduationYear) {
      query += ' AND ap.graduation_year = ?';
      params.push(graduationYear);
    }
    
    if (name) {
      query += ' AND (ap.first_name LIKE ? OR ap.last_name LIKE ?)';
      params.push(`%${name}%`, `%${name}%`);
    }
    
    // Execute query
    const [alumni] = await connection.query(query, params);
    
    connection.release();
    
    res.json({ alumni });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ message: 'Error fetching alumni data' });
  }
}

// Get alumni profile by ID
async function getAlumniById(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [profiles] = await connection.query(
      `SELECT ap.*, u.email, u.role, c.name as course_name, s.name as school_name 
       FROM alumni_profiles ap
       JOIN users u ON ap.user_id = u.id
       JOIN courses c ON ap.course_id = c.id
       JOIN schools s ON c.school_id = s.id
       WHERE ap.id = ?`,
      [req.params.id]
    );
    
    connection.release();
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }
    
    res.json({ profile: profiles[0] });
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ message: 'Error fetching alumni profile' });
  }
}

// Update role of an alumni (admin only)
async function updateAlumniRole(req, res) {
  const { userId, role } = req.body;
  
  if (!userId || !role) {
    return res.status(400).json({ message: 'User ID and role are required' });
  }
  
  if (!['admin', 'registered_alumni', 'applied_alumni', 'visitor'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Update user role
    const [result] = await connection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating alumni role:', error);
    res.status(500).json({ message: 'Error updating alumni role' });
  }
}

module.exports = {
  getAllAlumni,
  getAlumniById,
  updateAlumniRole
};