const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
// username and salting is defined by passportLocalMongoose automatically
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);