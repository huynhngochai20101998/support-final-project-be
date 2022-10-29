const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

const categoryController =  require('./category.controller');
const categoryRouter = express.Router();

categoryRouter.post('/add', auth, role.checkRole(role.ROLES.Admin), categoryController.createCategory);

categoryRouter.get('/', categoryController.getAllCategoriesForAdmin);

categoryRouter.put('/:id', auth, role.checkRole(role.ROLES.Admin), categoryController.updateCategory);

categoryRouter.get('/:id', auth, role.checkRole(role.ROLES.Admin), categoryController.getOneCategoryById);

categoryRouter.get('/:id/subcategory', categoryController.getAllSubcategories);

categoryRouter.post('/:id/subcategory/add', auth, role.checkRole(role.ROLES.Admin), categoryController.createSubcategory);



module.exports = categoryRouter;
