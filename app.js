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
const bmrRoute = require("./routes/bmr");
const nutrientsRoute = require("./routes/nutrients");
const userRoute = require("./routes/user");
const reportRoute = require("./routes/report");

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
app.use("/bmr", bmrRoute.router);
app.use("/nutrients", nutrientsRoute);
app.use("/user", userRoute);
app.use("/report", reportRoute);

// Home route
app.get("/", (req, res) => {
    res.render("home", {
        loggedIn: req.isAuthenticated(),
    });
});
app.use((req, res, next) => {
    res.render("404");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
