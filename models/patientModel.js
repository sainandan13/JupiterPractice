const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // Use your PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Function to create a new patient
const createPatient = async (firstName, lastName, abhaNumber, gender, dob, phone, email, address, medicalHistory) => {
    const result = await pool.query(
        `INSERT INTO patients 
        (first_name, last_name, abha_number, gender, dob, phone, email, address, medical_history) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [firstName, lastName, abhaNumber, gender, dob, phone, email, address, medicalHistory]
    );
    return result.rows[0];  // Return newly created patient
};

// Function to find a patient by ABHA number
const findPatientByABHA = async (abhaNumber) => {
    const result = await pool.query('SELECT * FROM patients WHERE abha_number = $1', [abhaNumber]);
    return result.rows[0];  // Return patient object or undefined
};

// Function to update a patient's information
const updatePatient = async (abhaNumber, updatedData) => {
    const { firstName, lastName, gender, dob, phone, email, address, medicalHistory } = updatedData;

    const result = await pool.query(
        `UPDATE patients SET 
        first_name = $1, last_name = $2, gender = $3, dob = $4, 
        phone = $5, email = $6, address = $7, medical_history = $8
        WHERE abha_number = $9 RETURNING *`,
        [firstName, lastName, gender, dob, phone, email, address, medicalHistory, abhaNumber]
    );
    return result.rows[0];  // Return updated patient
};

// Function to get patient history
const getPatientHistory = async (patientId) => {
    const visits = await pool.query('SELECT * FROM opd_visits WHERE patient_id = $1', [patientId]);
    const orders = await pool.query('SELECT * FROM orders WHERE patient_id = $1', [patientId]);

    return { visits: visits.rows, orders: orders.rows };
};

module.exports = { createPatient, findPatientByABHA, updatePatient, getPatientHistory };
