// Require dependencies
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const database = require("./config/db");

// Initialize Express app
const app = express();

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Import routes
const bmiRoute = require("./routes/bmi");
const mealRoute = require("./routes/meal");
const userRoute = require("./routes/user");

// Session middleware
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/bmi", bmiRoute.router);
app.use("/meal", mealRoute);
app.use("/user", userRoute);

// Home route
app.get("/", (req, res) => {
    res.render("home");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
