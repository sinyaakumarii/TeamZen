const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, checkRole(['admin', 'super_admin']), createAnnouncement);
router.get('/', verifyToken, getAnnouncements);

module.exports = router;