const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // Use your PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Function to create an order
const createOrder = async (patientId, visitId, orderedBy, orderType, items, status = 'pending') => {
    const result = await pool.query(
        `INSERT INTO orders (patient_id, visit_id, ordered_by, order_type, items, status, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
        [patientId, visitId, orderedBy, orderType, JSON.stringify(items), status]
    );
    return result.rows[0];  // Return newly created order
};

// Function to get orders by visit ID
const getOrdersByVisit = async (visitId) => {
    const result = await pool.query('SELECT * FROM orders WHERE visit_id = $1', [visitId]);
    return result.rows;  // Return all orders for the visit
};

// Function to update an order's status
const updateOrderStatus = async (orderId, newStatus) => {
    const result = await pool.query(
        `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
        [newStatus, orderId]
    );
    return result.rows[0];  // Return updated order
};

// Function to delete an order by ID
const deleteOrder = async (orderId) => {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
    return result.rows[0];  // Return deleted order
};

module.exports = { createOrder, getOrdersByVisit, updateOrderStatus, deleteOrder };
