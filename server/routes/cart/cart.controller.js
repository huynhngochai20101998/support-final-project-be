const Cart = require('../../models/cart');
const Product = require('../../models/product');
const store = require('../../helpers/store');


async function getAllMyCarts(req, res) {
  try {
    const carts = await Cart.find(
      {
        user: req.user,
        isOrdered :  false
      }
    ).populate('products.product')
    .populate('merchant','name');

    res.status(200).json({
      success : true,
      message : "",
      data : carts
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }

}

async function addProductToCart(req, res) {
  try {
    const products = req.body.products;
    const product = await Product.findById(products[0].product);
    
    
    if (product.quantity < products[0].quantity){
      res.status(400).json({
        success : false,
        message : `Only ${product.quantity} left in stock. Please take less!`,
        data : null
      });
      return;
    }
    const cart = await Cart.findOne(
      {
        $and: [
          { user: req.user._id },
          { merchant: products[0].merchant },
          { isOrdered :  false}
        ]
      }
    );
    if (cart != null) {
      const items = req.body.products;
      const firstProduct = items[0];
      
      let existProduct = -1;
      cart.products.forEach((item, index) => {
        if ((item.product._id.toString()) == (firstProduct.product)) {
          existProduct = index;
        }
      });
      if (existProduct != -1) {
        decreaseInventory([firstProduct],null);
        firstProduct.quantity += cart.products[existProduct].quantity
        const updatedProducts = store.caculateItemsPrice([firstProduct]);
        const query = { _id: cart._id };                          
        await Cart.updateOne(query, { $pull: { products: cart.products[existProduct] } }).exec();
        await Cart.updateOne(query, { $push: { products: updatedProducts } }).exec();
        const cartt = await Cart.findOne(query);
        const total = store.caculateCartTotal(cartt.products);
        await Cart.updateOne(query,{ $set: { total: total }});
        res.status(200).json({
          success: true,
          message : "Add product to cart successfully!",
          data : null
        });
      }
      else {
        const products = store.caculateItemsPrice(items);
        const total = store.caculateCartTotal(items);
        const query = { _id: cart._id };

        const cartDoc = await Cart.updateOne(query, { $push: { products: products },
                                                      $inc : {total : total}}).exec();
        decreaseInventory(products,null);
        res.status(200).json({
          success: true,
          message : "Add product to cart successfully!",
          data : null
        });
      }

    }
    else {
      const user = req.user._id;
      const items = req.body.products;
      const products = store.caculateItemsPrice(items);
      const merchant = products[0].merchant;
      const total = store.caculateCartTotal(items);
      const cart = new Cart({
        user,
        products,
        merchant,
        total
      });

      const cartDoc = await cart.save();

      decreaseInventory(products,null);

      res.status(200).json({
          success: true,
          message : "Add product to cart successfully!",
          data : cartDoc
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}
async function modifyQuantity(req, res) {
  try {
    const productId =  req.params.productId;
    const query = { _id: req.params.cartId };
    const previousQuantity = Number(req.body.previousQuantity);
    const nextQuantity = Number(req.body.nextQuantity);
    let cart = await Cart.findById(req.params.cartId);
    let element = -1;
    cart.products.forEach((item, index) => {
      if ((item._id.toString()) == (productId)) {
        element = index;
      }
    });
    console.log(typeof(previousQuantity));
    const price = cart.products[element].purchasePrice;
    const check = await Product.findById(cart.products[element].product._id);
    if ((check.quantity+previousQuantity)-nextQuantity < 0){
      res.status(400).json({
        success : false,
        message : `Only ${check.quantity + previousQuantity} left in stock. Please take less!`,
        data : null
      });
      return;
    }
    await Cart.updateOne(
      query,
      { $set: { "products.$[element].quantity": nextQuantity } },
      { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    decreaseInventory([cart.products[element]],previousQuantity,nextQuantity);
    await Cart.updateOne(
      query,
      {$set : { "products.$[element].totalPrice": nextQuantity*price },
       $inc : { total : (nextQuantity-previousQuantity)*price }},
      { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}

async function deleteCart(req, res) {
  try {
    let cart = await Cart.findById(req.params.cartId);
    increaseInventory(cart.products);
    await Cart.deleteOne({ _id: req.params.cartId });
    
    res.status(200).json({
      success: true,
      message: "Delete cart successfully!",
      data : null
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}


async function deleteProductFromCart(req, res) {
  try {
    const product = { product: req.params.productId };
    const query = { _id: req.params.cartId };
    let cart = await Cart.findById(req.params.cartId);
    let element = -1;
    cart.products.forEach((item, index) => {
      if ((item._id.toString()) == (req.params.productId)) {
        element = index;
      }
    });
   await Cart.updateOne(query, { $pull: { products: cart.products[element] } }).exec();
    increaseInventory([cart.products[element]]);
    const updatedCart = await Cart.findById(req.params.cartId);
    if(updatedCart.products.length == 0){
      await Cart.deleteOne({ _id: req.params.cartId });
    }
    res.status(200).json({
      success: true,
      message : false,
      data : null
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}


const decreaseInventory = (products,previousQuantity,nextQuantity) => {
  let bulkOptions = products.map(item => {
   if(previousQuantity != null){
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: (previousQuantity-nextQuantity) } }
      }
    };
   }else{
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity } }
        }
      }
    }
  });
  Product.bulkWrite(bulkOptions);
};
const increaseInventory = (products) => {
  let bulkOptions = products.map(item => {
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: +item.quantity } }
        }
      }
    
  });
  Product.bulkWrite(bulkOptions);
};


module.exports = {
  getAllMyCarts,
  deleteCart,
  addProductToCart,
  deleteProductFromCart,
  modifyQuantity
};
