const { Client } = require('pg');
require('dotenv').config();

const connectDB = async () => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'Meghalaya', // Replace with your actual database name
        password: 'root',
        port: 5432, // Default PostgreSQL port
    });

    try {
        await client.connect();
        console.log('PostgreSQL connected');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }

    return client; // Return the client to use in queries
};

module.exports = connectDB;
