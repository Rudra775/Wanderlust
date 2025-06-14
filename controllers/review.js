const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");

module.exports.createReview = wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();   

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
});

module.exports.destroyReviews = wrapAsync(async(req,res) => {
    let {id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {review: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
});