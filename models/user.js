const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const userSchema = new mongoose.Schema({
    first: String,
    last: String,
    username: String,
    password: String,
    bmi: Number,
    cal: Number,
    weight: Number,
    height: Number,
    gender: String,
});
userSchema.plugin(passportLocalMongoose);

// Create User model
const User = mongoose.model("User", userSchema);

// Configure Passport to use User model for authentication
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = User;
