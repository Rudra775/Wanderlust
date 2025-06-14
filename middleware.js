const Listing=require("./models/listing");
const Review=require("./models/review.js")
const ExpressError=require("./utils/ExpressError")
const {listingSchema}=require("./Schema");
const {reviewSchema}=require("./Schema.js")

module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req.user);
    
    if(!req.isAuthenticated()){
    // redirectUrl save
    // console.log(req.path,"..",req.originalUrl);
    req.session.redirectUrl = req.originalUrl;
    req.flash("error","You are not the Logged in login to continue!");
    return res.redirect("/user/login");
    }
    next(); 
}

// because passport reset the req.session after login value is true
// So new local middleware is created o solve that issue

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    let {id}= req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next)=>{
    let { id,reviewId}= req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`)
    }
    next();
}


module.exports.validateListing = (req,res,next)=>{
        // let result=listingSchema.validate(req.body);
        // console.log(result);
        let {error}=listingSchema.validate(req.body);
        console.log(error);
        if(error){
            let errMsg=error.details.map((el)=>el.message).join(",")
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
}

module.exports.validateReview=(req,res,next)=>{
        // let result=listingSchema.validate(req.body);
        // console.log(result);
        let {error}=reviewSchema.validate(req.body);
        console.log(error);
        if(error){
            let errMsg=error.details.map((el)=>el.message).join(",")
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
}