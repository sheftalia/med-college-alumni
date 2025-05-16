const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { schools } = require('../utils/schoolData');

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
    
    // Populate schools and courses from data
    for (const school of schools) {
      const [schoolResult] = await connection.query(
        'INSERT IGNORE INTO schools (name) VALUES (?)',
        [school.name]
      );
      
      const schoolId = schoolResult.insertId || 
        (await connection.query('SELECT id FROM schools WHERE name = ?', [school.name]))[0][0].id;
      
      for (const course of school.courses) {
        await connection.query(
          'INSERT IGNORE INTO courses (school_id, name, degree_type) VALUES (?, ?, ?)',
          [schoolId, course.name, course.degree_type]
        );
      }
    }
    
    // Create admin user if it doesn't exist
    const adminPassword = await require('bcryptjs').hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (email, password, role) 
      VALUES ('admin@medcollege.edu.gr', ?, 'admin')
    `, [adminPassword]);
    
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