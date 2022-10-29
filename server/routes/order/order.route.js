const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

const orderController =  require('./order.controller');
const orderRouter = express.Router();

orderRouter.get('/merchant',auth,role.checkRole(role.ROLES.Merchant),orderController.getAllMerchantOrder);

orderRouter.get('/',auth,orderController.getAllUserOrder);

orderRouter.post('/add', auth, orderController.proceedToOrder);

orderRouter.post('/proceed', auth, orderController.proceedToOrderMobile);

orderRouter.get('/:orderId',auth, orderController.getOrderById);

orderRouter.delete('/:orderId/cancel',auth, orderController.cancelOrder);

orderRouter.put('/:orderId/paypal', auth, orderController.completeOrderWithPaypal);

orderRouter.put('/:orderId', auth, orderController.completeOrder);

orderRouter.post('/:orderId/pay', auth, orderController.makePayment);

orderRouter.put('/:orderId/status', auth, orderController.changeStatus);

orderRouter.get('/:orderId/success', orderController.paySuccess);

orderRouter.get('/:orderId/fail', orderController.payFail);





module.exports = orderRouter;
