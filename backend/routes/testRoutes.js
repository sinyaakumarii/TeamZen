// routes/testRoutes.js
// TEMPORARY: used only to test the GPS distance calculation logic.

const express = require('express');
const router = express.Router();
const { isWithinOfficeRadius } = require('../utils/locationUtils');

router.post('/test-gps', (req, res) => {
  const { officeLat, officeLon, employeeLat, employeeLon, allowedRadius } = req.body;

  const result = isWithinOfficeRadius(officeLat, officeLon, employeeLat, employeeLon, allowedRadius);

  res.json({
    status: 'ok',
    ...result
  });
});

module.exports = router;