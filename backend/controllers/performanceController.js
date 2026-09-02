const db = require('../config/db');

exports.submitReview = async (req, res) => {
  try {
    const { employee_id, review_month, review_year, attendance_score, task_score, late_penalty } = req.body;
    const adminId = req.user.userId;

    let final_score = (attendance_score + task_score) - late_penalty;
    if (final_score > 100) final_score = 100;
    if (final_score < 0) final_score = 0;

    const [result] = await db.query(
      `INSERT INTO performance_reviews 
      (employee_id, reviewed_by, review_month, review_year, attendance_score, task_score, late_penalty, final_score) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, adminId, review_month, review_year, attendance_score, task_score, late_penalty, final_score]
    );

    res.status(201).json({
      status: 'success',
      message: 'Performance review calculated and saved successfully.',
      data: { review_id: result.insertId, final_score }
    });
  } catch (error) {
    console.error('Error submitting performance review:', error);
    res.status(500).json({ status: 'error', message: 'Server error while saving review', error: error.message });
  }
};

exports.generateRecommendation = async (req, res) => {
  try {
    const { review_id } = req.body;
    const [reviewRows] = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [review_id]);
    
    if (reviewRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Performance review not found.' });
    }

    const review = reviewRows[0];
    const score = review.final_score;
    let action = 'none';
    let reasoning = '';

    if (score >= 90) {
      action = 'bonus';
      reasoning = `Excellent performance with a score of ${score}/100. High productivity and great attendance. Recommended for a performance bonus.`;
    } else if (score >= 75) {
      action = 'increment';
      reasoning = `Good performance (${score}/100). Meets expectations. Recommended for a standard salary increment.`;
    } else if (score < 60) {
      action = 'warning';
      reasoning = `Below average performance (${score}/100). Needs immediate improvement in tasks and attendance.`;
    } else {
      action = 'none';
      reasoning = `Average performance (${score}/100). No financial action recommended at this time.`;
    }

    const [result] = await db.query(
      `INSERT INTO ai_recommendations (employee_id, review_id, suggested_action, reasoning, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [review.employee_id, review_id, action, reasoning]
    );

    res.status(201).json({
      status: 'success',
      message: 'AI Recommendation generated successfully.',
      data: { action, reasoning, status: 'pending' }
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};

exports.reviewRecommendation = async (req, res) => {
  try {
    const { recommendation_id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'error', message: "Status must be either 'approved' or 'rejected'." });
    }

    const [result] = await db.query(
      `UPDATE ai_recommendations SET status = ? WHERE id = ?`,
      [status, recommendation_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Recommendation not found.' });
    }

    res.json({
      status: 'success',
      message: `AI recommendation successfully ${status}.`
    });

  } catch (error) {
    console.error('Error reviewing recommendation:', error);
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};

// --- YEH FUNCTION ZAROORI THA DATA FETCH KARNE KE LIYE ---
exports.getAllRecommendations = async (req, res) => {
  try {
    const [recommendations] = await db.query(
      `SELECT ar.*, u.email as employee_email 
       FROM ai_recommendations ar
       JOIN employees e ON ar.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       ORDER BY ar.created_at DESC`
    );

    res.json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    res.status(500).json({ status: 'error', message: 'Server error while fetching recommendations', error: error.message });
  }
};
// --- NEW FUNCTION: GET MY PERFORMANCE (FOR EMPLOYEE) ---
exports.getMyPerformance = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. Find employee ID from user ID
    const [employeeRows] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employeeRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee record not found.' });
    }
    const employeeId = employeeRows[0].id;

    // 2. Fetch reviews and their approved recommendations
    const [reviews] = await db.query(
      `SELECT pr.*, ar.suggested_action, ar.status as rec_status
       FROM performance_reviews pr
       LEFT JOIN ai_recommendations ar ON pr.id = ar.review_id
       WHERE pr.employee_id = ?
       ORDER BY pr.created_at DESC`,
      [employeeId]
    );

    res.json({
      status: 'success',
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching my performance:', error);
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};