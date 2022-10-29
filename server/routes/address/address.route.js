const express = require('express');


// Bring in Models & Helpers
const auth = require('../../middleware/auth');
const addressController = require('./address.controller');

const addressRouter = express.Router();

addressRouter.get('/', auth, addressController.getAllAddresses);

addressRouter.post('/add', auth, addressController.createAddress);

addressRouter.get('/:id', auth, addressController.getAdressById);

addressRouter.put('/:id', auth, addressController.updateAddress);

addressRouter.delete('/:id', auth, addressController.deleteAddress);

module.exports = addressRouter;
