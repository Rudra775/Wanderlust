if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express"); 
const app = express(); 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const mongoose = require("mongoose");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport"); 
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

const dbUrl = process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "mysercretcode",
    },
    touchAfter: 24*3600,
})

store.on("error", () => {
    console.log("Error in mongo session store", err);
})

const sessionOption = {
    store,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production'
    }
};

// Root Route
// app.get("/", (req, res) => {
//     res.send("Hi, I'm root");
// });


// Session and Flash Setup
app.use(session(sessionOption));
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware
app.use((req,res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "rudraa_24",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
//Reviews
app.use("/listings/:id/reviews", reviewsRouter);

app.use("/",userRouter);

// Database Connection
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.log("DB Connection Error:", err);
    process.exit(1);
  });

async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
}

// 404 Error Handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// General Error Handler
// Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error", { err });
});

// Start Server
app.listen(8080, () => {
    console.log("Server running on port 8080");
});

// app.get("/testListing", async (req,res) => {
//     const testListing = new Listing({
//     title: "My New Villa",
//     description : "By the Beach", 
//     price : 1200, 
//     location : "Goa", 
//     country : "India"
//     })
//     await testListing.save();
//     console.log("sample was saved");
//     res.send("successful");
// })


