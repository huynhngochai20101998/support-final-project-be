const express = require('express');

const reviewController = require('./review.controller');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const reviewRouter = express.Router();

reviewRouter.post('/add', auth, reviewController.addReview);

reviewRouter.get('/', auth, reviewController.getMyReviews);

reviewRouter.get('/:id', reviewController.getReviewsOfProduct);

reviewRouter.put('/:id', auth, reviewController.updateReview);

reviewRouter.delete('/delete/:id', auth, reviewController.deleteReview);

module.exports = reviewRouter;





