const express = require('express');

const userController = require('./user.controller');
const auth = require('../../middleware/auth');

const userRouter = express.Router();

userRouter.get('/', auth, userController.getUserProfile);
userRouter.put('/',auth, userController.updateUserProfile);

module.exports = userRouter;