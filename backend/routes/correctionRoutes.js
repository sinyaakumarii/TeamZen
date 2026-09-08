// backend/routes/correctionRoutes.js
const express = require('express');
const router = express.Router();
const { requestCorrection, getCorrections, updateCorrectionStatus } = require('../controllers/correctionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requestCorrection);
router.get('/', verifyToken, checkRole(['admin', 'super_admin']), getCorrections);
router.put('/:id', verifyToken, checkRole(['admin', 'super_admin']), updateCorrectionStatus);

module.exports = router;