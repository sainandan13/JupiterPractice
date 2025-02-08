const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // Use your PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Function to create a new OPD visit
const createOpdVisit = async (patientId, doctorId, chiefComplaint, vitals, diagnosis, comments, followUpInstructions) => {
    const result = await pool.query(
        `INSERT INTO opd_visits (patient_id, doctor_id, visit_date, chief_complaint, vitals, diagnosis, comments, follow_up_instructions) 
        VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7) RETURNING *`,
        [patientId, doctorId, chiefComplaint, JSON.stringify(vitals), diagnosis, comments, followUpInstructions]
    );
    return result.rows[0];  // Return newly created OPD visit
};

// Function to get an OPD visit by ID
const getOpdVisitById = async (visitId) => {
    const result = await pool.query('SELECT * FROM opd_visits WHERE id = $1', [visitId]);
    return result.rows[0];  // Return OPD visit object or undefined
};

// Function to update an OPD visit
const updateOpdVisit = async (visitId, updatedData) => {
    const { chiefComplaint, vitals, diagnosis, comments, followUpInstructions } = updatedData;

    const result = await pool.query(
        `UPDATE opd_visits SET 
        chief_complaint = $1, vitals = $2, diagnosis = $3, 
        comments = $4, follow_up_instructions = $5 
        WHERE id = $6 RETURNING *`,
        [chiefComplaint, JSON.stringify(vitals), diagnosis, comments, followUpInstructions, visitId]
    );
    return result.rows[0];  // Return updated OPD visit
};

// Function to get all visits for a patient
const getVisitsForPatient = async (patientId) => {
    const result = await pool.query('SELECT * FROM opd_visits WHERE patient_id = $1', [patientId]);
    return result.rows;  // Return all OPD visits for the patient
};

module.exports = { createOpdVisit, getOpdVisitById, updateOpdVisit, getVisitsForPatient };
