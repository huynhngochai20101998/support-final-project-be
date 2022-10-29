const Product = require('../models/product');

exports.caculateItemsPrice = items => {
  const products = items.map(item => {
   
    item.totalPrice = 0;
    item.purchasePrice = item.price;

    const price = item.purchasePrice;
    const quantity = item.quantity;
    item.totalPrice = parseFloat(Number((price * quantity).toFixed(2)));

    return item;
  });

  return products;
};
// calculate Cart total
exports.caculateCartTotal = items => {
  var total = 0;
  items.forEach(function (item) {
    total += item.totalPrice;
});
  return total;
};


