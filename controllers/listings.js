const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { 
        listing, 
        mapToken: process.env.MAP_TOKEN,
        currUser: req.user
    });
};


module.exports.createListing = async (req, res, next) => {
  try {
    //Make sure user is logged in
    if (!req.user) {
      // throw new ExpressError('Login required', 401);
      res.redirect("/signup");
    }

    //Geocode
    const geoRes = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();

    if (!geoRes.body.features.length) {
      throw new ExpressError('Invalid location', 400);
    }

    //Build listing safely
    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.geometry = geoRes.body.features[0].geometry;

    if (req.file) {
      listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error('Error creating listing:', err);
    req.flash('error', `Failed to create listing: ${err.message}`);
    res.redirect('/listings/new');   // or: return next(err);
  }
};

module.exports.renderEditForm = async (req, res) => {  
    let { id } = req.params;  
    console.log(id);
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url?.replace("/upload", "/upload/h_300,w_250") || "";
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {  
    let { id } = req.params;

    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports.filter = async (req, res, next) => {
    let {id} = req.params;
    let allListing = await Listing.find({category: {$all: [id]}});
    if(allListing.length != 0) {
        res.locals.success = `Listing find by ${id}`;
        res.render("listings/index.ejs", {allListing});
    }
    else {
        req.flash("error", "Listing not available");
        res.redirect("/listings");
    }
};

module.exports.search = async (req, res) => {
    console.log(req.query.q);
    let input = req.query.q.trim().replace(/\s+/g, " "); // remove start and end space and middle space remove and middle add one space------
    console.log(input);
    if (input == "" || input == " ") {
      //search value empty
      req.flash("error", "Search value empty !!!");
      res.redirect("/listings");
    }
  
    // convert every word 1st latter capital and other small
    let data = input.split("");
    let element = "";
    let flag = false;
    for (let index = 0; index < data.length; index++) {
      if (index == 0 || flag) {
        element = element + data[index].toUpperCase();
      } else {
        element = element + data[index].toLowerCase();
      }
      flag = data[index] == " ";
    }
    console.log(element);
  
    let allListing = await Listing.find({
      title: { $regex: element, $options: "i" },
    });
    if (allListing.length != 0) {
      res.locals.success = "Listings searched by Title";
      res.render("listings/index.ejs", { allListing });
      return;
    }
    if (allListing.length == 0) {
      allListing = await Listing.find({
        category: { $regex: element, $options: "i" },
      }).sort({ _id: -1 });
      if (allListing.length != 0) {
        res.locals.success = "Listings searched by Category";
        res.render("listings/index.ejs", { allListing });
        return;
      }
    }
    if (allListing.length == 0) {
      allListing = await Listing.find({
        country: { $regex: element, $options: "i" },
      }).sort({ _id: -1 });
      if (allListing.length != 0) {
        res.locals.success = "Listings searched by Country";
        res.render("listings/index.ejs", { allListing });
        return;
      }
    }
    if (allListing.length == 0) {
      let allListing = await Listing.find({
        location: { $regex: element, $options: "i" },
      }).sort({ _id: -1 });
      if (allListing.length != 0) {
        res.locals.success = "Listings searched by Location";
        res.render("listings/index.ejs", { allListing });
        return;
      }
    }
    const intValue = parseInt(element, 10); // 10 for decimal return - int OR NaN
    const intDec = Number.isInteger(intValue); // check intValue is Number & Not Number return - true OR false
  
    if (allListing.length == 0 && intDec) {
      allListing = await Listing.find({ price: { $lte: element } }).sort({
        price: 1,
      });
      if (allListing.length != 0) {
        res.locals.success = `Listings searched for less than Rs ${element}`;
        res.render("listings/index.ejs", { allListing });
        return;
      }
    }
    if (allListing.length == 0) {
      req.flash("error", "Listings is not here !!!");
      res.redirect("/listings");
    }
  };