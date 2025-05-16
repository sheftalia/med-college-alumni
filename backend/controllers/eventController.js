const { pool } = require('../config/database');

// Get all events
async function getAllEvents(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [events] = await connection.query(
      `SELECT e.*, u.email as creator_email 
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date DESC`
    );
    
    connection.release();
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
}

// Get event by ID
async function getEventById(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [events] = await connection.query(
      `SELECT e.*, u.email as creator_email 
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    
    connection.release();
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ event: events[0] });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
}

// Create new event (admin only)
async function createEvent(req, res) {
  const { title, description, event_date, location } = req.body;
  
  if (!title || !event_date || !location) {
    return res.status(400).json({ message: 'Title, date and location are required' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO events (title, description, event_date, location, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, event_date, location, req.user.id]
    );
    
    connection.release();
    
    res.status(201).json({ 
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
}

// Update event (admin only)
async function updateEvent(req, res) {
  const { title, description, event_date, location } = req.body;
  const eventId = req.params.id;
  
  if (!title || !event_date || !location) {
    return res.status(400).json({ message: 'Title, date and location are required' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `UPDATE events SET 
        title = ?, 
        description = ?, 
        event_date = ?, 
        location = ? 
       WHERE id = ?`,
      [title, description, event_date, location, eventId]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
}

// Delete event (admin only)
async function deleteEvent(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'DELETE FROM events WHERE id = ?',
      [req.params.id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};