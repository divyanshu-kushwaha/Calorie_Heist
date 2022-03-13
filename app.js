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

const app = express();

//ejs environment
app.use(bodyParser.urlencoded({ extended: true }));
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
db.once("open", function () {
  console.log("Connected to Database successfully");
});

////////////////////////////// SCHEMA /////////////////////////////////////

const userSchema = new mongoose.Schema({
  first: String,
  last: String,
  username: String,
  password: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);

///////////////////////// PASSPORT //////////////////////////////////////////

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////////////////////////// ROUTES /////////////////////////////////

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/secrets", (req,res)=>{
  if(req.isAuthenticated()){
      User.find({"secret" : {$ne:null}}, function(err,foundUser){
          if(err){
              console.log(err);
          }else{
              if(foundUser){
                  res.render("secrets",{
                      usersWithSecrets: foundUser,
                      currentUser: req.user.username
                  })
              }
          }
      })
  }
  else{
    res.redirect("/login");
  }
})

app.get("/submit", (req,res)=>{
  if(req.isAuthenticated()){
    res.render("submit")
  }
  else{
    res.redirect("/login");
  }
})

app.post("/submit", (req,res)=>{
  const secretSubmitted = req.body.secret;
  const currUser = req.user._id; //we get the current users data from req.user

  User.findById(currUser, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        foundUser.secret = secretSubmitted;
        foundUser.save(function(){
          res.redirect("/secrets");
        })
      }
    }
  })
})

// dynamic page for each profile
app.get("/profile/:currentUser", (req,res)=>{
    // console.log(req.user);
    const currUserObject = req.user;

    res.render("dashboard",{
        currentUserObj: currUserObject
    })
})

var calorie=0;
var bmi=0;
var nutrient=0;

app.get("/bmi", function(req, res) {
  res.render("bmi" , {cal:calorie , bmi:bmi, nutrient:nutrient});
});

app.post("/bmi" , function(req,res){
    var weight = parseFloat(req.body.weight);
    var height = parseFloat(req.body.height);
    var weight1 = parseFloat(req.body.weight1);
    var height1 = parseFloat(req.body.height1);
    var age = parseFloat(req.body.age);
    var gender = req.body.sex;
    var k = parseFloat(req.body.activity);
    var result
    var result1 = weight1 / (height1/100 * height1/100);
    if(gender == "male"){
      result = 10*weight + 6.25*height - 5*k +5
    }

    else result = 10*weight + 6.25*height - 5*k - 161
    calorie = Math.floor(result)
    bmi = result1;

    //API part
    var food = req.body.food;
    var API_KEY = process.env.API_KEY;
    const url = "https://api.spoonacular.com/recipes/complexSearch?query=" + food + "&apiKey=" + API_KEY + "&number=1&addRecipeNutrition=true";
    https.get(url, function (response) {
      console.log(response.statusCode);
      var chunks = [];
        response.on("data", function (chunk) {
          chunks.push(chunk);
        });
        response.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          var data = JSON.parse(body);
          var result2 = Math.floor(data.results[0].nutrition.nutrients[0].amount);
          nutrient = result2
    });
    })
    res.redirect("/bmi");
});

app.get("/logout", (req,res)=>{
  req.logout();
  res.redirect("/");
})

app.post("/register", (req,res)=>{
    //storing info during registration
    const newUser = new User({
        first: req.body.firstName,
        last: req.body.lastName,
        username: req.body.username
    })

    //using in-built register method of passport
  User.register(newUser, req.body.password, (err,user)=>{
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      })
    }
  })
})

app.post("/login", (req,res)=>{
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      })
    }
  })
})

var calorie=0;
var bmi=0;
var nutrient=0;

app.get("/bmi", function(req, res) {
  res.render("bmi" , {cal:calorie , bmi:bmi, nutrient:nutrient});
});

app.post("/bmi" , function(req,res){
    var weight = parseFloat(req.body.weight);
    var height = parseFloat(req.body.height);
    var weight1 = parseFloat(req.body.weight1);
    var height1 = parseFloat(req.body.height1);
    var age = parseFloat(req.body.age);
    var gender = req.body.sex;
    var k = parseFloat(req.body.activity);
    var result
    var result1 = weight1 / (height1/100 * height1/100);
    if(gender == "male"){
      result = 10*weight + 6.25*height - 5*k +5
    }

    else result = 10*weight + 6.25*height - 5*k - 161
    calorie = Math.floor(result)
    bmi = result1;

    //API part
    var food = req.body.food;
    var API_KEY = process.env.API_KEY;
    const url = "https://api.spoonacular.com/recipes/complexSearch?query=" + food + "&apiKey=" + API_KEY + "&number=1&addRecipeNutrition=true";
    https.get(url, function (response) {
      console.log(response.statusCode);
      var chunks = [];
        response.on("data", function (chunk) {
          chunks.push(chunk);
        });
        response.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          var data = JSON.parse(body);
          var result2 = Math.floor(data.results[0].nutrition.nutrients[0].amount);
          nutrient = result2
    });
    })
    res.redirect("/bmi");
});


/////////////////////////////PORT////////////////////////////////////

app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
