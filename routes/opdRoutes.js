// opdRoutes.js
const express = require('express');
const router = express.Router();
const opdController = require('../controllers/opdController');
const { verifyToken } = require('../controllers/authController');

// Create a new OPD visit
router.post('/', verifyToken, opdController.createOpdVisit);
// Get an OPD visit by ID
router.get('/:visitId', verifyToken, opdController.getOpdVisitById);
// Update an OPD visit
router.put('/:visitId', verifyToken, opdController.updateOpdVisit);
// Get all visits for a patient
router.get('/patient/:patientId', verifyToken, opdController.getVisitsForPatient);

module.exports = router;
