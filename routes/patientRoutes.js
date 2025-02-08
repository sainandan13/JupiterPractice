// patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken } = require('../controllers/authController');

// Create a new patient
router.post('/', verifyToken, patientController.createPatient);
// Get patient by ABHA
router.get('/abha/:abhaNumber', verifyToken, patientController.getPatientByABHA);
// Update patient
router.put('/abha/:abhaNumber', verifyToken, patientController.updatePatient);
// Get patient history
router.get('/:patientId/history', verifyToken, patientController.getPatientHistory);

module.exports = router;
