const db = require('../config/db');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const adminId = req.user.userId;
    
    await db.query(
      'INSERT INTO announcements (title, message, created_by) VALUES (?, ?, ?)', 
      [title, message, adminId]
    );
    res.status(201).json({ status: 'success', message: 'Announcement posted successfully.' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.first_name, u.last_name 
       FROM announcements a 
       JOIN users u ON a.created_by = u.id 
       ORDER BY a.created_at DESC`
    );
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};