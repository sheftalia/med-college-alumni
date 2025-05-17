const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { schools } = require('../utils/schoolData');
const { alumniData } = require('../utils/alumniData');
const { eventData } = require('../utils/eventData');
const bcrypt = require('bcryptjs');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'donkument', //hardcoded password
  database: process.env.DB_NAME || 'med_college_alumni'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'registered_alumni', 'applied_alumni', 'visitor') DEFAULT 'visitor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create schools table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if school_color column exists before trying to add it
    const [schoolColorColumn] = await connection.query(`
      SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'schools' 
      AND COLUMN_NAME = 'school_color'
    `, [dbConfig.database]);

    // Add school_color column only if it doesn't exist
    if (schoolColorColumn.length === 0) {
      await connection.query(`
        ALTER TABLE schools
        ADD COLUMN school_color VARCHAR(7) DEFAULT '#9E0B0F'
      `);
    }
    
    // Create courses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT,
        name VARCHAR(255) NOT NULL,
        degree_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id)
      )
    `);
    
    // Create alumni profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alumni_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        graduation_year INT,
        course_id INT,
        bio TEXT,
        current_position VARCHAR(255),
        company VARCHAR(255),
        contact_email VARCHAR(255),
        phone VARCHAR(50),
        linkedin VARCHAR(255),
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);
    
    // Check if gender column exists before trying to add it
    const [columns] = await connection.query(`
      SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'alumni_profiles' 
      AND COLUMN_NAME = 'gender'
    `, [dbConfig.database]);
    
    // Add gender column only if it doesn't exist
    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE alumni_profiles
        ADD COLUMN gender ENUM('male', 'female') NULL
      `);
    }
    
    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    // Create messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_id INT NULL,
        school_id INT NULL,
        course_id INT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id),
        FOREIGN KEY (school_id) REFERENCES schools(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);
    
    // Populate schools and courses from data
    for (const school of schools) {
      // Check if the school already exists
      const [existingSchools] = await connection.query(
        'SELECT id FROM schools WHERE name = ?',
        [school.name]
      );
      
      let schoolId;
      
      if (existingSchools.length === 0) {
        // School doesn't exist, insert it
        const [schoolResult] = await connection.query(
          'INSERT INTO schools (name) VALUES (?)',
          [school.name]
        );
        schoolId = schoolResult.insertId;
      } else {
        // School already exists
        schoolId = existingSchools[0].id;
      }
      
      for (const course of school.courses) {
        // Check if the course already exists for this school
        const [existingCourses] = await connection.query(
          'SELECT id FROM courses WHERE school_id = ? AND name = ?',
          [schoolId, course.name]
        );
        
        if (existingCourses.length === 0) {
          // Course doesn't exist, insert it
          await connection.query(
            'INSERT INTO courses (school_id, name, degree_type) VALUES (?, ?, ?)',
            [schoolId, course.name, course.degree_type]
          );
        }
      }
    }
    
    // Update school colors
    const schoolColors = [
      { name: 'School of Arts & Design', color: '#8d5b87' },
      { name: 'Business School', color: '#2e4c9b' },
      { name: 'School of Computing', color: '#0085BE' },
      { name: 'School of Education', color: '#e86c3a' },
      { name: 'School of Engineering', color: '#4d4d4d' },
      { name: 'School of Health & Sport Sciences', color: '#0b6481' },
      { name: 'School of Psychology', color: '#a9bd3a' },
      { name: 'School of Shipping', color: '#bd9837' },
      { name: 'School of Tourism & Hospitality', color: '#9E0B0F' }
    ];
    
    for (const school of schoolColors) {
      await connection.query(
        'UPDATE schools SET school_color = ? WHERE name = ?',
        [school.color, school.name]
      );
    }
    
    // Create admin user if it doesn't exist
    const adminPassword = await bcrypt.hash('admin123', 10);
    const [adminResult] = await connection.query(`
      INSERT IGNORE INTO users (email, password, role) 
      VALUES ('admin@medcollege.edu.gr', ?, 'admin')
    `, [adminPassword]);
    
    // Get admin ID for creating events
    const [adminUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@medcollege.edu.gr']
    );
    const adminId = adminUser[0]?.id;
    
    // Add fake alumni data for demonstration
    const standardPassword = await bcrypt.hash('password123', 10);
    let firstTwoUsers = [];
    
    for (const alumni of alumniData) {
      try {
        // Find the course
        const [courseResults] = await connection.query(
          'SELECT c.id, c.school_id FROM courses c JOIN schools s ON c.school_id = s.id WHERE c.name = ? AND s.name = ?',
          [alumni.course, alumni.school]
        );
        
        if (courseResults.length > 0) {
          const courseId = courseResults[0].id;
          
          // Check if user with this email already exists
          const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [alumni.contact_email]
          );
          
          let userId;
          
          if (existingUsers.length === 0) {
            // Create user with the standard password
            const [userResult] = await connection.query(
              'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
              [alumni.contact_email, standardPassword, alumni.role || 'registered_alumni']
            );
            
            userId = userResult.insertId;
            
            // Store first two registered alumni for messages
            if (alumni.role === 'registered_alumni' && firstTwoUsers.length < 2) {
              firstTwoUsers.push(userId);
            }
          } else {
            userId = existingUsers[0].id;
            
            // Update the user's role if specified
            if (alumni.role) {
              await connection.query(
                'UPDATE users SET role = ? WHERE id = ?',
                [alumni.role, userId]
              );
            }
            
            // Check if this user should be in the first two users
            if (alumni.role === 'registered_alumni' && firstTwoUsers.length < 2) {
              firstTwoUsers.push(userId);
            }
          }
          
          // Check if profile already exists
          const [existingProfiles] = await connection.query(
            'SELECT id FROM alumni_profiles WHERE user_id = ?',
            [userId]
          );
          
          if (existingProfiles.length === 0) {
            // Create alumni profile
            await connection.query(
              `INSERT INTO alumni_profiles 
               (user_id, first_name, last_name, gender, graduation_year, course_id, 
                bio, current_position, company, contact_email, phone, linkedin)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId, 
                alumni.first_name, 
                alumni.last_name, 
                alumni.gender, 
                alumni.graduation_year, 
                courseId, 
                alumni.bio, 
                alumni.current_position,
                alumni.company, 
                alumni.contact_email, 
                alumni.phone, 
                alumni.linkedin
              ]
            );
          }
        }
      } catch (error) {
        console.error(`Error adding alumni ${alumni.first_name} ${alumni.last_name}:`, error);
      }
    }
    
    // Add events created by admin
    if (adminId) {
      for (const event of eventData) {
        // Check if event already exists
        const [existingEvents] = await connection.query(
          'SELECT id FROM events WHERE title = ? AND event_date = ?',
          [event.title, event.event_date]
        );
        
        if (existingEvents.length === 0) {
          // Event doesn't exist, insert it
          await connection.query(
            `INSERT INTO events (title, description, event_date, location, created_by) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              event.title,
              event.description,
              event.event_date,
              event.location,
              adminId
            ]
          );
        }
      }
    }
    
    // Add messages between first two alumni
    if (firstTwoUsers.length === 2) {
      // Check if messages already exist
      const [existingMessages] = await connection.query(
        'SELECT id FROM messages WHERE sender_id = ? AND recipient_id = ?',
        [firstTwoUsers[0], firstTwoUsers[1]]
      );
      
      if (existingMessages.length === 0) {
        // First message from user 1 to user 2
        await connection.query(
          `INSERT INTO messages (sender_id, recipient_id, subject, message) 
           VALUES (?, ?, ?, ?)`,
          [
            firstTwoUsers[0],
            firstTwoUsers[1],
            'Alumni Event',
            'Hey, it was great meeting you at the alumni event!'
          ]
        );
        
        // Reply from user 2 to user 1
        await connection.query(
          `INSERT INTO messages (sender_id, recipient_id, subject, message) 
           VALUES (?, ?, ?, ?)`,
          [
            firstTwoUsers[1],
            firstTwoUsers[0],
            'Re: Alumni Event',
            'Are you attending the next alumni meetup?'
          ]
        );
      }
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Export the pool to be used in other files
module.exports = {
  pool,
  initializeDatabase
};