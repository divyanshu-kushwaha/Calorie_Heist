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
  secret: String,
  cal: Number
});

const dietSchema = new mongoose.Schema({
  date: String,
  calorie: Number
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


// dynamic page for each profile
app.get("/profile/:currentUser", (req,res)=>{
    // console.log(req.user);
    const currUserObject = req.user;
    res.render("dashboard",{currentUserObj: currUserObject});
})

app.get("/logout", (req,res)=>{
  req.logout();
  res.redirect("/");
})

app.post("/register", (req,res)=>{
    //storing info during registration

    const Diet = new mongoose.model(req.body.username, dietSchema);

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

      })
    }
  })
})

var calorie=0;
var bmi=0;

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
    res.redirect("/bmi");
});

app.get("/update", function(req, res) {
  res.render("update");
});

app.post("/update" , function(req,res){
  var currUserObj = req.user;
    var weight = parseFloat(req.body.weight);
    var height = parseFloat(req.body.height);
    var weight1 = parseFloat(req.body.weight1);
    var height1 = parseFloat(req.body.height1);
    var age = parseFloat(req.body.age);
    var gender = req.body.sex;
    var k = parseFloat(req.body.activity);
    var bmr
    if(gender == "male"){
      bmr = 10*weight + 6.25*height - 5*k +5
    }
    else bmr = 10*weight + 6.25*height - 5*k - 161

    var m = parseFloat(req.body.aim);

    bmr = bmr + m;
     var ans = Math.floor(bmr);
     var per = mongoose.model('User');
    per.updateOne({username: currUserObj.username},{cal: ans},function(err,data){
      if(err) console.log(err);
      if(data) console.log("success");
    })
    res.redirect("/profile/" + currUserObj.username);
});

var nutrients=0;

app.get("/meal", function(req, res) {
  res.render("meal" , {nutrients:nutrients});
});

app.post("/meal" , function(req,res){
  var currUserObject = req.user;

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
    //API part
    var food = req.body.food;
    var API_KEY = process.env.API_KEY;
    const url1 = "https://api.spoonacular.com/recipes/complexSearch?query=" + food + "&apiKey=" + API_KEY + "&number=1&addRecipeNutrition=true";

    //HTTPS get
    https.get(url1, function (response) {
      console.log(response.statusCode);
      var chunks = [];
        response.on("data", function (chunk) {
          chunks.push(chunk);
        });
        response.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          var data = JSON.parse(body);
          var result2 = Math.floor(data.results[0].nutrition.nutrients[0].amount);
          nutrients = result2
    });
    })
    var day = mongoose.model(currUserObject.username,dietSchema);
    var day1 = mongoose.model(currUserObject.username);
    day1.findOne({date:today} , function(err,result){
      if(err){
        console.log(err);
      }
      else if(result == null){
        const newDate = new day({
            date: today,
            calorie: nutrients
        });
        newDate.save();
      }
      else{
        var num = result.calorie;
        day1.updateOne({date:today},
    {calorie:num+nutrients}, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
    }
});
      }
    })
    res.redirect("/meal");
});

/////////////////////////////PORT////////////////////////////////////

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000.");
});
