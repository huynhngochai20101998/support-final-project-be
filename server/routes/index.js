const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');
const cartRouter = require('./cart/cart.route');
const userRouter = require('./user/user.route');
const addressRouter = require('./address/address.route');
const categoryRouter = require('./category/category.route');
const subcategoryRouter = require('./subcategory/subcategory.route');
const merchantRouter = require('./merchant/merchant.route');
const productRouter = require('./product/product.route');
const wishlistRouter = require('./wishlist/wishlist.route');
const reviewRouter = require('./review/review.route');
const orderRouter = require('./order/order.route');

router.use('/auth',authRouter);
router.use('/user',userRouter);
router.use('/cart',cartRouter);
router.use('/address',addressRouter);
router.use('/category', categoryRouter);
router.use('/subcategory', subcategoryRouter);
router.use('/merchant',merchantRouter);
router.use('/product', productRouter);
router.use('/wishlist',wishlistRouter);
router.use('/review',reviewRouter);
router.use('/order',orderRouter);



module.exports = router;