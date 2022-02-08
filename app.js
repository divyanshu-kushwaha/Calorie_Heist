//jshint esversion:6
require('dotenv').config();

const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const https = require('https');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

////////////////////////// CONNECTING TO MONGODB ATLAS ///////////////////////////

mongoose.connect('process.env.DATABASE',
  {
    useNewUrlParser: true
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected to Database successfully");
});

////////////////////////////// SCHEMA /////////////////////////////////////

const userSchema = new mongoose.Schema ({
  first: String,
  last: String,
  email: String,
  password: String
});

//////////////////// ENCRYPTION PART ///////////////////////////////

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"]});

///////////////////////// REGISTER //////////////////////////////////////////

const User = new mongoose.model('User', userSchema);

app.post("/register", function(req,res){
  const newUser = new User({
    first: req.body.firstName,
    last: req.body.lastName,
    email: req.body.username,
    password: req.body.password
  })



  newUser.save(function(err){
    if (err) {
console.log(err);
    } else {
res.render("secrets");
    }
  });
});

//////////////////////// AUTHENTICATION PART /////////////////////////////////////

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username},function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }
        else{
          res.send("Wrong Password! Please enter correct password.");
        }
      }
      else{
        res.send("User not found. Register First.");
      }
    }
  });
});

/////////////////////////////////////////////////////////////////////

app.get("/", function(req,res){
  res.render("home");
})

app.get("/register", function(req,res){
  res.render("register");
})

app.get("/login", function(req,res){
  res.render("login");
})

/////////////////////////////////////////////////////////////////////

app.listen(3000, function(){
  console.log("Server is running on port 3000.");
});
