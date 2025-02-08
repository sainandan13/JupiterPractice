require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const opdRoutes = require('./routes/opdRoutes');

const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
// Additional routes: authRoutes, patientRoutes, opdRoutes, etc.

const app = express();
app.use(express.json());
app.use(cors());

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
// ... likewise for auth, patient, opd

const HOST = '0.0.0.0'
app.listen(process.env.PORT || 5000, HOST,() => {
    console.log('Server running on port 5000');
});
