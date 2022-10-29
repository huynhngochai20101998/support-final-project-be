const express =require('express');
const passport = require('passport');

const auth = require('../../middleware/auth');

const authController = require('./auth.controller');

const authRouter = express.Router();

authRouter.post('/login', authController.login);

authRouter.post('/register', authController.register);

authRouter.post('/forgot',authController.forgotPassword);

authRouter.post('/reset/:token',authController.resetPasswordWithToken);

authRouter.post('/password',auth,authController.changePassword);


module.exports = authRouter;
