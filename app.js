//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bmiRoute = require('./routes/bmi');
const mealRoute = require('./routes/meal');

const app = express();

//ejs environment
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

///////////////////////////SESSION/////////////////////////////////
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

////////////////////////// CONNECTING TO MONGODB ATLAS ///////////////////////////

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
});
// mongoose.set("useCreateIndex", true);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function() {
    console.log("Connected to Database successfully");
});

////////////////////////////// SCHEMA /////////////////////////////////////

const userSchema = new mongoose.Schema({
    first: String,
    last: String,
    username: String,
    password: String,
    bmi: Number,
    cal: Number,
    weight: Number,
    height: Number,
    gender: String
});

const dietSchema = new mongoose.Schema({
    date: String,
    calorie: Number,
});

userSchema.plugin(passportLocalMongoose);

///////////////////////// PASSPORT //////////////////////////////////////////

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////////////////////////// ROUTES /////////////////////////////////

app.use('/bmi', bmiRoute.router);
app.use('/meal', mealRoute);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/login", function(req, res) {
    res.render("login");
});

// dynamic page for each profile
app.get("/profile/:currentUser", (req, res) => {
    // console.log(req.user);
    const currUserObject = req.user;
    res.render("dashboard", {
        currentUserObj: currUserObject
    });
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req, res) => {
    //storing info during registration

    // const Diet = new mongoose.model(req.body.username, dietSchema);

    const newUser = new User({
        first: req.body.firstName,
        last: req.body.lastName,
        username: req.body.username,
    });

    //using in-built register method of passport
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/update");
            });
        }
    });
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/profile/" + req.user.username);
            });
        }
    });
});


//BMI


app.get("/update", function(req, res) {
    if (req.isAuthenticated()) {
        User.find({
            secret: {
                $ne: null
            }
        }, function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    res.render("update");
                }
            }
        });
    } else {
        res.redirect("/register");
    }
});

app.post("/update", function(req, res) {
    var currUserObj = req.user;
    var weight = parseFloat(req.body.weight);
    var height = parseFloat(req.body.height);
    var age = parseFloat(req.body.age);
    var gender = req.body.sex;
    var k = parseFloat(req.body.activity);
    var m = parseFloat(req.body.aim);

    var bmr = bmiRoute.calculateBMR(weight, height, gender, k) + m;
    var ans = Math.floor(bmr);
    var bmi = bmiRoute.calculateBMI(weight, height);

    User.findById(currUserObj._id, function(err, foundUser){
      if(err){
        console.log(err);
      }
      else{
        if(foundUser){
          {
              foundUser.weight = weight,
              foundUser.height = height,
              foundUser.bmi = bmi,
              foundUser.cal = ans,
              foundUser.gender = gender
          };

          foundUser.save(function(){
            res.redirect("/profile/" + currUserObj.username);
          })
        }
      }
    })

});




/////////////////////////////PORT////////////////////////////////////

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on port 3000.");
});
