// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const officeSettingsRoutes = require('./routes/officeSettingsRoutes');
const faceRoutes = require('./routes/faceRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const taskRoutes = require('./routes/taskRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');      // Naya import
const documentRoutes = require('./routes/documentRoutes');    // Naya import
const announcementRoutes = require('./routes/announcementRoutes');
const correctionRoutes = require('./routes/correctionRoutes');
app.use('/api/corrections', correctionRoutes);

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/settings', officeSettingsRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/payroll', payrollRoutes);           // Naya route
app.use('/api/documents', documentRoutes);   
app.use('/api/announcements', announcementRoutes);
     // Naya route

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});