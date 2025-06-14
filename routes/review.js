const express = require("express");
const router = express.Router({mergeParams : true}); 
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware")
const reviewController = require("../controllers/review");
const wrapAsync = require("../utils/wrapAsync.js");

//Post
router.post(
    "/", 
    isLoggedIn, 
    validateReview, 
    wrapAsync(reviewController.createReview)
);

//Delete Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReviews)
);

module.exports = router;