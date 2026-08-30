// backend/controllers/performanceController.js
const db = require('../config/db');

exports.submitReview = async (req, res) => {
  try {
    const { employee_id, review_month, review_year, attendance_score, task_score, late_penalty } = req.body;
    const adminId = req.user.userId; // Admin ID automatically JWT token se aayegi

    // AI Scoring Logic (Simple Rules-Based Formula)
    // Total 100 = Attendance (50) + Tasks (50) - Late Penalties
    let final_score = (attendance_score + task_score) - late_penalty;
    
    // Limits set karna taake score 100 se upar ya 0 se neeche na jaye
    if (final_score > 100) final_score = 100;
    if (final_score < 0) final_score = 0;

    // Database mein save karna
    const [result] = await db.query(
      `INSERT INTO performance_reviews 
      (employee_id, reviewed_by, review_month, review_year, attendance_score, task_score, late_penalty, final_score) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, adminId, review_month, review_year, attendance_score, task_score, late_penalty, final_score]
    );

    res.status(201).json({
      status: 'success',
      message: 'Performance review calculated and saved successfully.',
      data: {
        review_id: result.insertId,
        final_score: final_score,
        grade: final_score >= 90 ? 'A+' : final_score >= 80 ? 'A' : final_score >= 70 ? 'B' : 'C'
      }
    });
  } catch (error) {
    console.error('Error submitting performance review:', error);
    res.status(500).json({ status: 'error', message: 'Server error while saving review', error: error.message });
  }
};