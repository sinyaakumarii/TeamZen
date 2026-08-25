// routes/faceRoutes.js
const express = require('express');
const router = express.Router();
const { registerFace, getFaceStatus } = require('../controllers/faceController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', verifyToken, registerFace);
router.get('/status', verifyToken, getFaceStatus);

module.exports = router;