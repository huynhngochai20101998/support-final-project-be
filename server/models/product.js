const Mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const { Schema } = Mongoose;

const options = {
  separator: '-',
  lang: 'en',
  truncate: 120
};

Mongoose.plugin(slug, options);

// Product Schema
const ProductSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  slug: {
    type: String,
    slug : 'name',
    unique: true
  },
  imageUrl: {
    type: String
  },
  imageId: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number
  },
  price: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  merchant : {
    type : Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    required: true
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory',
    default: null,
    required: false
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Product', ProductSchema);
