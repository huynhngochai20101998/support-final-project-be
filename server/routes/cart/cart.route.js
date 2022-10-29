const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

const cartController =  require('./cart.controller');
const cartRouter = express.Router();

cartRouter.get('/', auth, cartController.getAllMyCarts);

cartRouter.post('/add', auth, cartController.addProductToCart);

cartRouter.delete('/delete/:cartId/:productId', auth, cartController.deleteProductFromCart);

cartRouter.delete('/delete/:cartId', auth, cartController.deleteCart);

cartRouter.put('/:cartId/modify/:productId',auth, cartController.modifyQuantity);


module.exports = cartRouter;
