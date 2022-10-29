const express = require('express');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');


const subcategoryController =  require('./subcategory.controller');
const subcategoryRouter = express.Router();

//subcategoryRouter.post('/add', auth, role.checkRole(role.ROLES.Admin), subcategoryController.createSubcategory);

//subcategoryRouter.get('/', subcategoryController.getAllSubcategory);

subcategoryRouter.get('/:id', subcategoryController.getOneSubcategoryById);

subcategoryRouter.put('/:id', auth, role.checkRole(role.ROLES.Admin), subcategoryController.updateSubcategory);


module.exports = subcategoryRouter;
