const express = require('express');
const upload = require('../../services/multer');

const productRouter = express.Router();


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const checkAuth = require('../../helpers/auth');

const productController = require('./product.controller');

productRouter.get('/item/:slug', productController.getProductBySlug);

productRouter.post('/list', productController.filterProduct);

productRouter.get('/list/search/:name', productController.searchProduct);

productRouter.get('/list/merchant/:slug', productController.getProductsOfMerchant);

// -------------- MERCHANT -----------------

productRouter.get('/trashes',auth,role.checkRole( role.ROLES.Merchant), productController.getTrashProducts);

productRouter.get('/:id',auth,role.checkRole( role.ROLES.Merchant), productController.getProductById);

productRouter.post('/add',auth,role.checkRole(role.ROLES.Merchant),upload.array('image'), productController.addProduct);

productRouter.put('/:id',auth,role.checkRole( role.ROLES.Merchant),upload.array('image'), productController.updateProduct);

productRouter.put('/delete/:id',auth,role.checkRole( role.ROLES.Merchant), productController.softDeleteProduct);

productRouter.put('/restore/:id',auth,role.checkRole( role.ROLES.Merchant), productController.restoreProduct);

productRouter.delete('/:id',auth,role.checkRole(role.ROLES.Merchant), productController.deleteProduct);

module.exports = productRouter;
