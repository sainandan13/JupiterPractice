const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { patientId, visitId, orderedBy, orderType, items } = req.body;

        // Optional: Check for duplicate orders on the same day
        const duplicateCheck = await pool.query(
            `SELECT * FROM orders 
            WHERE patient_id = $1 AND order_type = $2 
            AND created_at::DATE = CURRENT_DATE 
            AND EXISTS (SELECT 1 FROM jsonb_array_elements(items) WHERE items @> $3)`,
            [patientId, orderType, JSON.stringify(items)]
        );

        if (duplicateCheck.rows.length > 0) {
            // Create a notification for duplicate order
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
                [orderedBy, 'Duplicate order detected for this patient.']
            );
        }

        // Insert new order into the database
        const result = await pool.query(
            `INSERT INTO orders (patient_id, visit_id, ordered_by, order_type, items, created_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [patientId, visitId, orderedBy, orderType, JSON.stringify(items)]
        );

        // Check if any item is critical and send a notification
        const hasCritical = items.some(item => item.isCritical === true);
        if (hasCritical) {
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
                [orderedBy, 'A critical test result/order has been marked for this patient.']
            );
        }

        return res.status(201).json({ success: true, order: result.rows[0] });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all orders by visit ID
exports.getOrdersByVisit = async (req, res) => {
    try {
        const { visitId } = req.params;

        const result = await pool.query(
            `SELECT orders.*, users.name AS ordered_by_name, users.email AS ordered_by_email 
            FROM orders 
            JOIN users ON orders.ordered_by = users.id 
            WHERE orders.visit_id = $1`,
            [visitId]
        );

        return res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get frequent order sets based on diagnosis
exports.getFrequentOrderSets = async (req, res) => {
    try {
        const { diagnosis } = req.query;

        let query = `SELECT * FROM order_sets`;
        let values = [];

        if (diagnosis) {
            query += ` WHERE diagnosis = $1`;
            values.push(diagnosis);
        }

        const result = await pool.query(query, values);
        return res.json(result.rows);
    } catch (error) {
        console.error('Error fetching order sets:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create an order from an existing order set
exports.createOrderFromSet = async (req, res) => {
    try {
        const { orderSetId, patientId, visitId, orderedBy } = req.body;

        const orderSetResult = await pool.query(
            `SELECT * FROM order_sets WHERE id = $1`,
            [orderSetId]
        );

        if (orderSetResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order set not found' });
        }

        const orderSet = orderSetResult.rows[0];

        // Create new order from the set
        const newOrder = await pool.query(
            `INSERT INTO orders (patient_id, visit_id, ordered_by, order_type, items, created_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [patientId, visitId, orderedBy, orderSet.order_type, JSON.stringify(orderSet.items)]
        );

        return res.status(201).json({ success: true, order: newOrder.rows[0] });
    } catch (error) {
        console.error('Error creating order from set:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
