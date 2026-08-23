// routes/officeSettingsRoutes.js
const express = require('express');
const router = express.Router();
const { saveOfficeSettings, getOfficeSettings } = require('../controllers/officeSettingsController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Only Admin and Super Admin can create/update office settings
router.post('/', verifyToken, checkRole(['admin', 'super_admin']), saveOfficeSettings);

// Any logged-in user in the organization can view the settings (needed for attendance check-in later)
router.get('/', verifyToken, getOfficeSettings);

module.exports = router;