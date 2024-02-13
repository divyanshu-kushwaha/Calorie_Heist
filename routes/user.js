const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const bmiRoute = require("./bmi");

// Register Route
router.get("/register", function (req, res) {
    res.render("register");
});

router.post("/register", (req, res) => {
    const newUser = new User({
        first: req.body.firstName,
        last: req.body.lastName,
        username: req.body.username,
    });

    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/user/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/user/update");
            });
        }
    });
});

// Login Route

router.get("/login", function (req, res) {
    res.render("login");
});
router.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/user/profile/" + req.user.username);
            });
        }
    });
});

// Profile Route
router.get("/profile/:currentUser", (req, res) => {
    const currUserObject = req.user;
    res.render("dashboard", { currentUserObj: currUserObject });
});

// Logout Route
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Update Route
router.get("/update", (req, res) => {
    if (req.isAuthenticated()) {
        User.find({ secret: { $ne: null } }, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    res.render("update");
                }
            }
        });
    } else {
        res.redirect("/user/register");
    }
});

router.post("/update", (req, res) => {
    const currUserObj = req.user;
    const weight = parseFloat(req.body.weight);
    const height = parseFloat(req.body.height);
    const age = parseFloat(req.body.age);
    const gender = req.body.sex;
    const k = parseFloat(req.body.activity);
    const m = parseFloat(req.body.aim);

    const bmr = bmiRoute.calculateBMR(weight, height, gender, k) + m;
    const ans = Math.floor(bmr);
    const bmi = bmiRoute.calculateBMI(weight, height);

    User.findById(currUserObj._id, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.weight = weight;
                foundUser.height = height;
                foundUser.bmi = bmi;
                foundUser.cal = ans;
                foundUser.gender = gender;

                foundUser.save(() => {
                    res.redirect("/user/profile/" + currUserObj.username);
                });
            }
        }
    });
});

module.exports = router;