//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const ejs = require("ejs");
const request = require("request");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bmiRoute = require('./routes/bmi');
const mealRoute = require('./routes/meal');
const { log } = require("console");

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

const mealSchema = new mongoose.Schema({
    date: {
      type: String,
      required: true,
    },
    calorie: {
      type: Number,
      default: 0.0,
    },
    fat: {
      type: Number,
      default: 0.0,
    },
    saturated_fat: {
      type: Number,
      default: 0.0,
    },
    protein: {
      type: Number,
      default: 0.0,
    },
    sodium: {
      type: Number,
      default: 0.0,
    },
    calorie: {
      type: Number,
      default: 0.0,
    },
    potassium: {
      type: Number,
      default: 0.0,
    },
    sodium: {
      type: Number,
      default: 0.0,
    },
    potassium: {
      type: Number,
      default: 0.0,
    },
    cholestrol: {
      type: Number,
      default: 0.0,
    },
    carbohydrates: {
      type: Number,
      default: 0.0,
    },
    fiber: {
      type: Number,
      default: 0.0,
    },
    sugar: {
      type: Number,
      default: 0.0,
    }
  });

userSchema.plugin(passportLocalMongoose);

///////////////////////// PASSPORT //////////////////////////////////////////

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////////////////////////// ROUTES /////////////////////////////////

app.use('/bmi', bmiRoute.router);
app.get("/meal", function (req, res) {
    res.render('meal', { foodItemList: null });
});
app.post('/meal', function(req, res) {
    const food = req.body.food;
    var currUserObject = req.user
    const API_KEY = process.env.API_KEY;
    request.get(
        {
            url: "https://api.calorieninjas.com/v1/nutrition?query=" + food,
            headers: {
                "X-Api-Key": API_KEY,
            },
        },
        function (error, response, body) {
            if (error) return console.error("Request failed:", error);
            else if (response.statusCode !== 200)
                return console.error(
                    "Error:",
                    response.statusCode,
                    body.toString("utf8")
                );
            else {
                const foodItemList = JSON.parse(body).items;
                res.render('meal', { foodItemList });
            }
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;

            var userMeal = mongoose.model(currUserObject, mealSchema);
            userMeal.findOne({ date: today }, function (err, result) {
                if (err) {
                    console.log(err);
                }
                else if (result == null) {
                    const newDate = new userMeal({
                        date: today,
                        calorie: foodItemList.calorie,
                        fat: foodItemList.fat,
                        saturated_fat: foodItemList.saturated_fat,
                        protein: foodItemList.protein,
                        calorie: foodItemList.calorie,
                        potassium: foodItemList.potassium,
                        sodium: foodItemList.sodium,
                        cholestrol: foodItemList.cholestrol,
                        carbohydrates: foodItemList.carbohydrates,
                        fiber: foodItemList.fiber,
                        sugar: foodItemList.sugar,
                    });
                    newDate.save();
                }
                else {
                    var num = result.calorie;
                    day1.updateOne({ date: today },
                        {
                            calorie: num + nutrients,
                            fat: result.fat + foodItemList.fat,
                            saturated_fat: result.saturated_fat + foodItemList.saturated_fat,
                            protein: result.protein + foodItemList.protein,
                            calorie: result.calorie + foodItemList.calorie,
                            potassium: result.potassium + foodItemList.potassium,
                            sodium: result.sodium + foodItemList.sodium,
                            cholestrol: result.cholestrol + foodItemList.cholestrol,
                            carbohydrates: result.carbohydrates + foodItemList.carbohydrates,
                            fiber: result.fiber + foodItemList.fiber,
                            sugar: result.sugar + foodItemList.sugar
                        }, function (err, docs) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                console.log("Updated successfullyful");
                            }
                        });
                }
            });
        }
    );
})

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
    const userMeal = mongoose.model(req.body.username, mealSchema);
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
