const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Cart Item Schema
const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: Number,
  purchasePrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  merchant : {
    type: Schema.Types.ObjectId,
    ref: 'Merchant'
  }
});

module.exports = Mongoose.model('CartItem', CartItemSchema);

// Cart Schema
const CartSchema = new Schema({
  products: [CartItemSchema],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  merchant : {
    type: Schema.Types.ObjectId,
    ref: 'Merchant'
  },
  total : {
    type : Number,
    default : 0
  },
  isOrdered : {
    type : Boolean,
    default : false
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Cart', CartSchema);
