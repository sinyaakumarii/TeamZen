// routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const { createOrganization, getOrganizations } = require('../controllers/organizationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, checkRole(['super_admin']), createOrganization);
router.get('/', verifyToken, getOrganizations);

module.exports = router;