// Bring in Models & Helpers
const Review = require('../../models/review');
const Product = require('../../models/product');

async function addReview(req, res){
  const user = req.user;

  const check = await Review.find({user : user});

  if (check != null) {
    res.status(200).json({
      success: true,
      message: `You already review this product. You can only review once at each product.`,
    });
  }

  const review = new Review(Object.assign(req.body, { user: user._id }));

  review.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Your review has been added successfully!`,
      data : review
    });
  });
}

async function getMyReviews(req, res){
  try {
    const reviews = await Review.find({user : req.user})
      .populate({
        path: 'product',
        select: 'name slug imageUrl'
      })
      .sort('-created');

    res.status(200).json({
      success : true,
      data : reviews
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getReviewsOfProduct(req, res){
  try {
    const productDoc = await Product.findOne({ _id : req.params.id });

    if (!productDoc || (productDoc && productDoc?.merchant?.isActive === false)) {
      return res.status(404).json({
        message: 'No reviews for this product.'
      });
    }

    const reviews = await Review.find({
      product: productDoc._id
    })
      .populate({
        path: 'user',
        select: 'firstName'
      })
      .sort('-created');

    res.status(200).json({
      success : true,
      data : reviews
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function updateReview(req, res){
  try {
    const reviewId = req.params.id;
    const update = req.body;
    const query = { _id: reviewId };

    await Review.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Review has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function deleteReview(req, res){
    try {
    const review = await Review.findOne({ _id: req.params.id})
    console.log(review);
    var deletedReview = null;
    if (req.user.role == "ROLE_ADMIN" || String(review.user) == String(req.user._id))
    {
        deletedReview = await Review.deleteOne({ _id: req.params.id });
    }
    if(deletedReview){
      res.status(200).json({
        success: true,
        message: `Review has been deleted successfully!`,
        data : deletedReview
      });
    }
    else{
      res.status(403).json({
        success: false,
        message: `You have no right to delete this review!`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
 
}

module.exports = {
    addReview,
    updateReview,
    getMyReviews,
    getReviewsOfProduct,
    deleteReview
};
