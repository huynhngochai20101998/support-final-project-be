const passport = require('passport');
const mongoose = require('mongoose');
  

const auth = passport.authenticate('jwt', { session: false, }) ;   

module.exports = auth;
