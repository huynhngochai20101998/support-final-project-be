const cloudinary = require('../../services/cloudinary')
const fs = require('fs');
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

const Mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

// Bring in Models & Helpers
const User = require('../../models/user');
const Product = require('../../models/product');
const Merchant = require('../../models/merchant');
const Category = require('../../models/category');
const Subcategory = require('../../models/subcategory');
const Wishlist = require('../../models/wishlist');
const checkAuth = require('../../helpers/auth');




//  -------------- USER -----------------
// fetch product slug api
 async function getProductBySlug(req, res){
  try {
    const slug = req.params.slug;

    const productDoc = await Product.findOne({ slug, isActive: true}).populate(
      {
        path: 'merchant',
        select: 'name isActive slug'
      }
    );

    if (!productDoc || (productDoc && productDoc?.merchant?.isActive === false)) {
      return res.status(404).json({
        success : false,
        message: 'No product found!'
      });
    }

    res.status(200).json({
      success : true,
      data : productDoc
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

// fetch  product name search api
 async function searchProduct(req, res) {
  try {
    const name = req.params.name;

    const productDoc = await Product.find(
      { name: { $regex: new RegExp(name), $options: 'is' }, isActive: true },
      { name: 1, slug: 1, imageUrl: 1, price: 1, _id: 0 }
    );

    if (productDoc.length < 0) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    res.status(200).json({
      products: productDoc
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

// fetch store products by advancedFilters api
async function filterProduct(req, res){
  try {
    let {
      name,
      merchant,
      sortOrder,
      rating,
      max,
      min,
      category,
     
      pageNumber: page = 1
    } = req.body;

    const pageSize = 8;
    const categoryFilter = category ? { category } : {};
    
    const merchantFilter = merchant ? { merchant } : {};
    const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};
    const ratingFilter = rating
      ? { rating: { $gte: rating } }
      : { rating: { $gte: rating } };

    const basicQuery = [
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          totalRatings: { $sum: '$reviews.rating' },
          totalReviews: { $size: '$reviews' }
        }
      },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $eq: ['$totalReviews', 0] },
              0,
              { $divide: ['$totalRatings', '$totalReviews'] }
            ]
          }
        }
      },
      {
        $match: {
          isActive: true,
          price: priceFilter.price,
          averageRating: ratingFilter.rating,
          name: { $regex: new RegExp(name), $options: 'is' }
        }
      },
      {
        $project: {
          reviews: 0
        }
      }
    ];
  let productsMerchant = null;
  if (merchant != null){
    const merchantDoc = await Merchant.findOne({ slug: merchantFilter.merchant, isActive: true });
    if (merchantDoc){
      productsMerchant = await Product.find({merchant : merchantDoc._id}, '_id');
    }
    const ids = [];
    productsMerchant.forEach(product => {
     ids.push(product._id)
   });
    if ((merchantDoc) && (merchantFilter !== merchant)) {
      basicQuery.push({
        $match: {
          isActive: true,
          _id: {
            $in: Array.from(ids)
          }
        }
      });
    }
  }

    const userDoc = await checkAuth(req);
    let productsCategory = null;
    if(category != null ){
    const categoryDoc = await Category.findOne({ slug: categoryFilter.category, isActive: true });
    const subcategoryDoc = await Subcategory.findOne({ slug: categoryFilter.category, isActive: true });
    if (categoryDoc){
      productsCategory = await Product.find({category : categoryDoc._id}, '_id');
    } else if (subcategoryDoc){
      productsCategory = await Product.find({subcategory : subcategoryDoc._id});
    }
    const ids = [];
    productsCategory.forEach(product => {
     ids.push(product._id)
   });
    if ((categoryDoc || subcategoryDoc) && (categoryFilter !== category || subcategoryFilter !== subcategory)) {
      basicQuery.push({
        $match: {
          isActive: true,
          _id: {
            $in: Array.from(ids)
          }
        }
      });
    }
   }

    let products = null;
    let productsCount = 0;

    if (userDoc) {
      productsCount = await Product.aggregate(
        [
          {
            $lookup: {
              from: 'wishlists',
              let: { product: '$_id' },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$$product', '$product'] } },
                      { user: new Mongoose.Types.ObjectId(userDoc.id) }
                    ]
                  }
                }
              ],
              as: 'isLiked'
            }
          },
          {
            $addFields: {
              isLiked: { $arrayElemAt: ['$isLiked.isLiked', 0] }
            }
          }
        ].concat(basicQuery)
      );
      const paginateQuery = [
        { $sort: sortOrder },
        { $skip: pageSize * (productsCount.length > 8 ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      products = await Product.aggregate(
        [
          {
            $lookup: {
              from: 'wishlists',
              let: { product: '$_id' },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ['$$product', '$product'] } },
                      { user: new Mongoose.Types.ObjectId(userDoc.id) }
                    ]
                  }
                }
              ],
              as: 'isLiked'
            }
          },
          {
            $addFields: {
              isLiked: { $arrayElemAt: ['$isLiked.isLiked', 0] }
            }
          }
        ]
          .concat(basicQuery)
          .concat(paginateQuery)
      );
    } else {
      productsCount = await Product.aggregate(basicQuery);
      const paginateQuery = [
        { $sort: sortOrder },
        { $skip: pageSize * (productsCount.length > 8 ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      if (page == -1){
        products = await Product.aggregate(basicQuery);
    }else{
      products = await Product.aggregate(basicQuery.concat(paginateQuery));
    }
    }

    res.status(200).json({
      success : true,
      message : "",
      data : {
      products,
      page,
      pages:
        productsCount.length > 0
          ? Math.ceil(productsCount.length / pageSize)
          : 0,
      totalProducts: productsCount.length
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
// fetch all products of a merchant 
 async function getProductsOfMerchant(req, res){
  try {
    const slug = req.params.slug;

    const merchant = await Merchant.findOne({ slug, isActive: true });

    if (!merchant) {
      return res.status(404).json({
        success : false,
      data : null,
      message : "Cannot find merchant with the name: ${slug}."
      });
    }

    const userDoc = await checkAuth(req);

    if (userDoc) {
      const products = await Product.aggregate([
        {
          $match: {
            isActive: true,
            merchant: merchant._id
          }
        },
        {
          $lookup: {
            from: 'wishlists',
            let: { product: '$_id' },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ['$$product', '$product'] } },
                    { user: new Mongoose.Types.ObjectId(userDoc.id) }
                  ]
                }
              }
            ],
            as: 'isLiked'
          }
        },
        {
          $lookup: {
            from: 'merchants',
            localField: 'merchant',
            foreignField: '_id',
            as: 'merchants'
          }
        },
        {
          $addFields: {
            isLiked: { $arrayElemAt: ['$isLiked.isLiked', 0] }
          }
        },
        {
          $unwind: '$merchants'
        },
        {
          $addFields: {
            'merchant.name': '$merchants.name',
            'merchant._id': '$merchants._id',
            'merchant.isActive': '$merchants.isActive'
          }
        },
        { $project: { merchants: 0 } }
      ]);

      res.status(200).json({
        success : true,
        data :{
        products: products.reverse().slice(0, 8),
        page: 1,
        pages: products.length > 0 ? Math.ceil(products.length / 8) : 0,
        totalProducts: products.length}
      });
    } else {
      const products = await Product.find({
        merchant: merchant._id,
        isActive: true
      }).populate('merchant', 'name');

      res.status(200).json({
        success : true,
        message : "",
        data : {
        products: products.reverse().slice(0, 8),
        page: 1,
        pages: products.length > 0 ? Math.ceil(products.length / 8) : 0,
        totalProducts: products.length
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function selectProduct(req, res){
  try {
    const products = await Product.find({}, 'name');

    res.status(200).json({
      products
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

// -------------- MERCHANT -----------------
// Get product by id
async function getProductById(req, res){
  try {
    const productId = req.params.id;

    const productDoc = await Product.findOne({ _id: productId })
    

    if (!productDoc) {
      return res.status(404).json({
        success : false,
        message: 'No product found.'
      });
    }
    res.status(200).json({
      success : true,
      data : productDoc
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
// add product 
  async function addProduct(req, res){
    try {
      const name = req.body.name;
      const description = req.body.description;
      const quantity = req.body.quantity;
      const price = req.body.price;
      const subcategory = req.body.subcategory
      const image = req.files[0];
      const merchant = req.user.merchant

      const subcate = await Subcategory.findById(subcategory);
      const category = subcate.category;
      
      if (!description || !name) {
        return res
          .status(400)
          .json({ success : false,
            data : null,
            message : 'You must enter description & name.' });
      }

      if (!quantity) {
        return res.status(400).json({ success : false,
          data : null,
          message : 'You must enter a quantity.' });
      }

      if (!price) {
        return res.status(400).json({ success : false,
          data : null,
          message : 'You must enter a price.' });
      }

      if (!subcategory) {
        return res.status(400).json({ success : false,
          data : null,
          message : 'You must choose subcategory.' });
      }

      const uploader = async (path) => await cloudinary.uploads(path, 'Images');

      let imageUrl = '';
      let imageId = '';

      if (image) {
        const { path } = image;
        const newPath = await uploader(path)
        imageUrl = newPath.url;
        imageId = newPath.id;
      }
      await unlinkAsync(req.files[0].path);

      const product = new Product({
        name,
        description,
        quantity,
        price,
        category,
        subcategory,
        merchant,
        imageUrl,
        imageId
      });

      const savedProduct = await product.save();

      res.status(200).json({
        success: true,
        message: 'Product has been added successfully!',
        product: savedProduct
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
      });
    }
}


// Update product
async function updateProduct(req, res){
    try {
      const productId = req.params.id;
      const query = { _id: productId };
      let update = req.body;
      const image = req.files[0];
      //Check product id is exist
      const productDoc = await Product.findById(productId);
      if (!productDoc) {
        return res.status(404).json({
          message: 'No product found.'
        });
      }
      if (!req.body.description || !req.body.name) {
        return res
          .status(400)
          .json({success : false,
            data : null,
            message : 'You must enter description & name' });
      }

      if (!req.body.quantity) {
        return res.status(400).json({ success : false,
          data : null,
          message : 'You must enter a quantity.' });
      }

      if (!req.body.price) {
        return res.status(400).json({ success : false,
          data : null,
          message : 'You must enter a price.' });
      }

      
      const uploader = async (path) => await cloudinary.uploads(path, 'Images');

      let imageUrl = '';
      let imageId = '';
      if (image) {
        const { path } = image;
        const newPath= await uploader(path);
        imageUrl = newPath.url;
        imageId = newPath.id;
      }
      await unlinkAsync(req.files[0].path);
      
      update["imageUrl"] = imageUrl;
      update["imageId"] = imageId;

      await Product.findOneAndUpdate(query,update, {
        new: true
      });
      
      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!',
        data : null
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success : false,
        data : null,
      message : 'Your request could not be processed. Please try again.'
      });
    }
}
// soft delete product
async function softDeleteProduct(req, res){
    try {
      const productId = req.params.id;
      const query = { _id: productId };

      const productDoc = await Product.findOneAndUpdate(query, {isActive : false}, {
        new: true
      });
      if (!productDoc) {
        return res.status(404).json({
          success : false,
          data : null,
          message : 'No product found with the id ${productId}.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product has been inactived!',
        data : null
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
}

async function getTrashProducts(req,res){
  try {
    const merchantUser = await User.findOne({_id : req.user._id});
    const trashes = await Product.find({
      $and: [
        {isActive : false},
        {merchant : merchantUser.merchant}
      ]
    })

    res.status(200).json({
      trashes
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function restoreProduct(req, res){
  try {
    const productId = req.params.id;
    const query = { _id: productId };

    const productDoc = await Product.findOneAndUpdate(query, {isActive : true}, {
      new: true
    });
    if (!productDoc) {
      return res.status(404).json({
        success : false,
        data : null,
        message: 'No product found with the id ${productId} .'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product has been actived!',
      data : null
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

// Delete product
async function deleteProduct(req, res){
    try {
      const product = await Product.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: 'Product has been deleted successfully!',
        product
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
}

module.exports = {
    getProductBySlug,
    searchProduct,
    filterProduct,
    getProductById,
    addProduct,
    updateProduct,
    softDeleteProduct,
    getTrashProducts,
    deleteProduct,
    restoreProduct,
    getProductsOfMerchant
};