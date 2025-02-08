const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // PostgreSQL database name
    password: 'root',
    port: 5432,
});

// Get all notifications for a specific user
exports.getNotificationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        return res.json(result.rows); // Return all notifications for the user
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const result = await pool.query(
            'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
            [notificationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.json(result.rows[0]); // Return updated notification
    } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
