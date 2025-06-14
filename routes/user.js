const express = require("express");
const router = express.Router();
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware");
const userController = require("../controllers/users");

// Root route
router.get("/", (req, res) => {
    res.redirect("/listings");
});

router
    .route("/signup")
    .get(userController.renderSignup)
    .post(userController.signup);

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: '/login',
            failureFlash: true
        }),
        userController.login
    );

router.get("/logout", userController.logout);

module.exports = router; 