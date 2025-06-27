const express = require("express");
const router = express.Router({mergeParams: true}); 
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");
const reviewController = require("../controllers/review");

// Post Review Route
router.post(
    "/", 
    isLoggedIn, 
    validateReview, 
    reviewController.createReview
);

// Delete Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    reviewController.destroyReviews
);

module.exports = router;