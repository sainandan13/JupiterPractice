const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'your_database_name',  // Change this to your actual PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Function to find a user by email
const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // Return user object or undefined
};

// Function to create a new user
const createUser = async (name, email, hashedPassword, role) => {
    const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, hashedPassword, role]
    );
    return result.rows[0]; // Return new user object
};

module.exports = { findUserByEmail, createUser };
