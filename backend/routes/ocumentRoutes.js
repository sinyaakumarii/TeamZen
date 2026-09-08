// backend/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { addDocument, getDocuments } = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, addDocument);
router.get('/:employee_id', verifyToken, getDocuments);

module.exports = router;