const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Create a new patient
exports.createPatient = async (req, res) => {
    try {
        const { firstName, lastName, abhaNumber, gender, dob, contactInfo } = req.body;
        if (!contactInfo || !contactInfo.phone || !contactInfo.email || !contactInfo.address) {
            return res.status(400).json({ success: false, message: 'Contact details are required' });
        }

        if (!contactInfo.phone || !contactInfo.email || !contactInfo.address) {
            return res.status(400).json({ success: false, message: 'Contact details are required' });
        }


        console.log("Received patient data:", req.body);  // ✅ Debugging

        const { phone, email, address } = contactInfo;
        // Check if patient with ABHA exists
        const existingPatient = await pool.query(
            'SELECT * FROM patients WHERE abha_number = $1',
            [abhaNumber]
        );

        if (existingPatient.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Patient with this ABHA number already exists' });
        }

        // Insert new patient into the database
        const result = await pool.query(
            `INSERT INTO patients (first_name, last_name, abha_number, gender, dob, phone, email, address, medical_history)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [firstName, lastName, abhaNumber, gender, dob, contactInfo.phone, contactInfo.email, contactInfo.address, []]
        );

        return res.status(201).json({ success: true, patient: result.rows[0] });
    } catch (error) {
        console.error('Error creating patient:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get patient by ABHA number
exports.getPatientByABHA = async (req, res) => {
    try {
        const { abhaNumber } = req.params;

        const result = await pool.query(
            'SELECT * FROM patients WHERE abha_number = $1',
            [abhaNumber]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        return res.json({ success: true, patient: result.rows[0] });
    } catch (error) {
        console.error('Error retrieving patient:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update patient information
exports.updatePatient = async (req, res) => {
    try {
        const { abhaNumber } = req.params;
        const { firstName, lastName, gender, dob, contactInfo } = req.body;

        const result = await pool.query(
            `UPDATE patients
             SET first_name = $1, last_name = $2, gender = $3, dob = $4, phone = $5, email = $6, address = $7
             WHERE abha_number = $8 RETURNING *`,
            [firstName, lastName, gender, dob, contactInfo.phone, contactInfo.email, contactInfo.address, abhaNumber]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        return res.json({ success: true, patient: result.rows[0] });
    } catch (error) {
        console.error('Error updating patient:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Retrieve patient's past visits and orders
exports.getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Verify patient exists
        const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);

        if (patientResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Find OPD visits
        const visitsResult = await pool.query(
            `SELECT opd_visits.*, users.name AS doctor_name
             FROM opd_visits
                      JOIN users ON opd_visits.doctor_id = users.id
             WHERE opd_visits.patient_id = $1`,
            [patientId]
        );

        // Find all orders for this patient
        const ordersResult = await pool.query(
            `SELECT orders.*, users.name AS ordered_by_name
             FROM orders
                      JOIN users ON orders.ordered_by = users.id
             WHERE orders.patient_id = $1`,
            [patientId]
        );

        return res.json({
            success: true,
            patient: patientResult.rows[0],
            visits: visitsResult.rows,
            orders: ordersResult.rows
        });
    } catch (error) {
        console.error('Error retrieving patient history:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
