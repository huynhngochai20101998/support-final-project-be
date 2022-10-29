const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Order Schema
const OrderSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  merchant : {
    type: Schema.Types.ObjectId,
    ref: 'Merchant'
  },
  payment : {
    type: String,
    default: 'CASH',
    enum: ['CASH', 'PAYPAL']
  },
 address : {
    type : String,
    default : null
  },
  phoneNumber : {
    type : String,
    default : null
  },
  status : {
    type: String,
    default: 'NOT_PROCESS',
    enum: ['NOT_PROCESS', 'PROCESSING','DELIVERING','RECEIVED','CANCEL']
  },
  paymentStatus: {
    type: String,
    default: 'NOT_PAID',
    enum: ['NOT_PAID', 'PAID']
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Order', OrderSchema);
