const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Create a new OPD visit
exports.createOpdVisit = async (req, res) => {
    try {
        const { patientId, doctorId, chiefComplaint, vitals, diagnosis, comments, followUpInstructions } = req.body;

        // Verify that patient exists
        const patientExists = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);
        if (patientExists.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Insert OPD visit into the database
        const result = await pool.query(
            `INSERT INTO opd_visits 
            (patient_id, doctor_id, visit_date, chief_complaint, vitals, diagnosis, comments, follow_up_instructions) 
            VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7) RETURNING *`,
            [patientId, doctorId, chiefComplaint, JSON.stringify(vitals), diagnosis, comments, followUpInstructions]
        );

        return res.status(201).json({ success: true, visit: result.rows[0] });
    } catch (error) {
        console.error('Error creating OPD visit:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get an OPD visit by ID
exports.getOpdVisitById = async (req, res) => {
    try {
        const { visitId } = req.params;

        const result = await pool.query(
            `SELECT opd_visits.*, users.name AS doctor_name 
            FROM opd_visits 
            JOIN users ON opd_visits.doctor_id = users.id 
            WHERE opd_visits.id = $1`,
            [visitId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Visit not found' });
        }

        return res.json({ success: true, visit: result.rows[0] });
    } catch (error) {
        console.error('Error fetching OPD visit:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update an OPD visit
exports.updateOpdVisit = async (req, res) => {
    try {
        const { visitId } = req.params;
        const { chiefComplaint, vitals, diagnosis, comments, followUpInstructions } = req.body;

        const result = await pool.query(
            `UPDATE opd_visits 
            SET chief_complaint = $1, vitals = $2, diagnosis = $3, comments = $4, follow_up_instructions = $5 
            WHERE id = $6 RETURNING *`,
            [chiefComplaint, JSON.stringify(vitals), diagnosis, comments, followUpInstructions, visitId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'OPD visit not found' });
        }

        return res.json({ success: true, visit: result.rows[0] });
    } catch (error) {
        console.error('Error updating OPD visit:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all OPD visits for a patient
exports.getVisitsForPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        const result = await pool.query(
            `SELECT opd_visits.*, users.name AS doctor_name 
            FROM opd_visits 
            JOIN users ON opd_visits.doctor_id = users.id 
            WHERE opd_visits.patient_id = $1`,
            [patientId]
        );

        return res.json({ success: true, visits: result.rows });
    } catch (error) {
        console.error('Error fetching OPD visits:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
