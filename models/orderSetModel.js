const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // Use your PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Function to create a new order set
const createOrderSet = async (name, orderType, diagnosis, items, createdBy) => {
    const result = await pool.query(
        `INSERT INTO order_sets (name, order_type, diagnosis, items, created_by) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, orderType, diagnosis, JSON.stringify(items), createdBy]
    );
    return result.rows[0];  // Return newly created order set
};

// Function to get an order set by ID
const getOrderSetById = async (orderSetId) => {
    const result = await pool.query('SELECT * FROM order_sets WHERE id = $1', [orderSetId]);
    return result.rows[0];  // Return order set object or undefined
};

// Function to get all order sets
const getAllOrderSets = async () => {
    const result = await pool.query('SELECT * FROM order_sets');
    return result.rows;  // Return all order sets
};

// Function to delete an order set by ID
const deleteOrderSet = async (orderSetId) => {
    const result = await pool.query('DELETE FROM order_sets WHERE id = $1 RETURNING *', [orderSetId]);
    return result.rows[0];  // Return deleted order set
};

module.exports = { createOrderSet, getOrderSetById, getAllOrderSets, deleteOrderSet };
