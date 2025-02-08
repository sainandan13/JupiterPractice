const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:userId', verifyToken, notificationController.getNotificationsForUser);
router.put('/read/:notificationId', verifyToken, notificationController.markAsRead);

module.exports = router;
