const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // Use your PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Function to create a new notification
const createNotification = async (userId, message) => {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, message, read, created_at) 
        VALUES ($1, $2, false, NOW()) RETURNING *`,
        [userId, message]
    );
    return result.rows[0];  // Return newly created notification
};

// Function to get notifications for a user
const getNotificationsForUser = async (userId) => {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;  // Return notifications for the user
};

// Function to mark a notification as read
const markNotificationAsRead = async (notificationId) => {
    const result = await pool.query(
        `UPDATE notifications SET read = true WHERE id = $1 RETURNING *`,
        [notificationId]
    );
    return result.rows[0];  // Return updated notification
};

// Function to delete a notification
const deleteNotification = async (notificationId) => {
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [notificationId]);
    return result.rows[0];  // Return deleted notification
};

module.exports = { createNotification, getNotificationsForUser, markNotificationAsRead, deleteNotification };
