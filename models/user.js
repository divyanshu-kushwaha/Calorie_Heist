const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const dietSchema = new mongoose.Schema({
    calories: Number,
    servingSize: Number,
    fat: Number,
    saturatedFat: Number,
    protein: Number,
    cholesterol : Number,
    carbohydrates: Number,
    fiber: Number,
    sugar: Number,
});


const userSchema = new mongoose.Schema({
    first: String,
    last: String,
    username: {
        type:String,
        unique: true
    },
    password: String,
    bmi: Number,
    cal: Number,
    weight: Number,
    height: Number,
    gender: String,
    nutrients: {
        type: Map,
        of: dietSchema
      
    }
    
});
userSchema.plugin(passportLocalMongoose);

// Create User model
const User = mongoose.model("User", userSchema);

// Configure Passport to use User model for authentication
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = User;
