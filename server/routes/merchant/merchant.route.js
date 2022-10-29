const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const merchantController = require('./merchant.controller');
const role = require('../../middleware/role');
const merchantRouter = express.Router();



merchantRouter.get('/categories', auth,role.checkRole(role.ROLES.Merchant), merchantController.getCategoriesOfMerchant);

merchantRouter.get('/categories/all', auth,role.checkRole(role.ROLES.Merchant), merchantController.getAllCategoriesOfMerchant);

merchantRouter.get('/', auth, role.checkRole(role.ROLES.Admin), merchantController.getAllMerchants);

merchantRouter.get('/requests',auth, role.checkRole(role.ROLES.Admin), merchantController.getAllMerchantRequests);

merchantRouter.post('/seller-request',auth, role.checkRole(role.ROLES.Customer), merchantController.requestNewMerchantApproval);

merchantRouter.put('/approve/:merchantId', auth,role.checkRole(role.ROLES.Admin), merchantController.approveMerchantApplication);

merchantRouter.put('/reject/:merchantId', auth,role.checkRole(role.ROLES.Admin),  merchantController.rejectMerchantApplication);


merchantRouter.post('/add', auth, role.checkRole(role.ROLES.Admin), merchantController.createMerchant);

merchantRouter.get('/:id/:category', merchantController.getMerchantById);

merchantRouter.put('/:id', auth,role.checkRole(role.ROLES.Admin,role.ROLES.Merchant), merchantController.updateMerchant);

merchantRouter.get('/category/:id/products', auth, role.checkRole(role.ROLES.Merchant), merchantController.getProductOfCategory);

merchantRouter.get('/subcategory/:id/products', auth, role.checkRole(role.ROLES.Merchant), merchantController.getProductOfSubcategory);

merchantRouter.put('/delete/:id', auth,role.checkRole(role.ROLES.Admin), merchantController.softDeleteMerchant);

merchantRouter.put('/restore/:id', auth,role.checkRole(role.ROLES.Admin), merchantController.restoreMerchant);


module.exports = merchantRouter;
