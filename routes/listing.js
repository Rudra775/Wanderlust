const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer")
const {storage} = require("../cloudConfig.js")
const upload = multer({storage})

router
    .route("/")
    // Index Route get /Listings for showing all cards
    .get(wrapAsync(listingController.index))
    //create Route
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing))
    // .post(upload.single("listing[image]"),(req,res)=>{
    //     res.send(req.file);
    // });
// New & create Route 
router.get("/new",isLoggedIn,listingController.renderNewForm);


router
    .route("/:id")
    // Show route /listing/:id
    .get(wrapAsync(listingController.showListing))
    //update
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
    // Delete Route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))

// Edit 
router.get("/:id/edit",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.renderEditForm));


//Filter Route
router.get("/filter/:id", wrapAsync(listingController.filter)); 

router.get("/search", wrapAsync(listingController.search));

module.exports = router; 