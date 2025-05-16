const { pool } = require('../config/database');

// Get all messages for the current user
async function getUserMessages(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [messages] = await connection.query(
      `SELECT m.*, 
        s.first_name AS sender_first_name, 
        s.last_name AS sender_last_name,
        r.first_name AS recipient_first_name, 
        r.last_name AS recipient_last_name,
        sch.name AS school_name,
        c.name AS course_name
       FROM messages m
       LEFT JOIN alumni_profiles s ON m.sender_id = s.user_id
       LEFT JOIN alumni_profiles r ON m.recipient_id = r.user_id
       LEFT JOIN schools sch ON m.school_id = sch.id
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.recipient_id = ? OR 
             (m.recipient_id IS NULL AND 
              (m.school_id IN (SELECT c.school_id FROM alumni_profiles ap 
                              JOIN courses c ON ap.course_id = c.id 
                              WHERE ap.user_id = ?) OR 
               m.course_id IN (SELECT ap.course_id FROM alumni_profiles ap 
                              WHERE ap.user_id = ?)))
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.id, req.user.id]
    );
    
    connection.release();
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
}

// Get sent messages by the current user
async function getSentMessages(req, res) {
  try {
    const connection = await pool.getConnection();
    
    const [messages] = await connection.query(
      `SELECT m.*, 
        s.first_name AS sender_first_name, 
        s.last_name AS sender_last_name,
        r.first_name AS recipient_first_name, 
        r.last_name AS recipient_last_name,
        sch.name AS school_name,
        c.name AS course_name
       FROM messages m
       LEFT JOIN alumni_profiles s ON m.sender_id = s.user_id
       LEFT JOIN alumni_profiles r ON m.recipient_id = r.user_id
       LEFT JOIN schools sch ON m.school_id = sch.id
       LEFT JOIN courses c ON m.course_id = c.id
       WHERE m.sender_id = ?
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    
    connection.release();
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Error fetching sent messages' });
  }
}

// Send a message
async function sendMessage(req, res) {
  const { recipient_id, school_id, course_id, subject, message } = req.body;
  
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }
  
  // Must have at least one recipient (individual, school, or course)
  if (!recipient_id && !school_id && !course_id) {
    return res.status(400).json({ message: 'At least one recipient is required' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO messages 
        (sender_id, recipient_id, school_id, course_id, subject, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, recipient_id || null, school_id || null, course_id || null, subject, message]
    );
    
    connection.release();
    
    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
}

// Mark message as read
async function markAsRead(req, res) {
  try {
    const connection = await pool.getConnection();
    
    // Verify the message belongs to the user
    const [messages] = await connection.query(
      `SELECT * FROM messages 
       WHERE id = ? AND 
            (recipient_id = ? OR 
             (recipient_id IS NULL AND 
              (school_id IN (SELECT c.school_id FROM alumni_profiles ap 
                            JOIN courses c ON ap.course_id = c.id 
                            WHERE ap.user_id = ?) OR 
               course_id IN (SELECT ap.course_id FROM alumni_profiles ap 
                            WHERE ap.user_id = ?))))`,
      [req.params.id, req.user.id, req.user.id, req.user.id]
    );
    
    if (messages.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Message not found or access denied' });
    }
    
    // Mark the message as read
    await connection.query(
      'UPDATE messages SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    
    connection.release();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
}

module.exports = {
  getUserMessages,
  getSentMessages,
  sendMessage,
  markAsRead
};