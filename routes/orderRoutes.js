const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, orderController.createOrder);
router.get('/visit/:visitId', verifyToken, orderController.getOrdersByVisit);
router.get('/frequent', verifyToken, orderController.getFrequentOrderSets);
router.post('/from-set', verifyToken, orderController.createOrderFromSet);

module.exports = router;
