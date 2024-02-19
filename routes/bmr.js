const express = require("express");
const router = express.Router();

function calculateBMR(weight, height, gender, activity) {
    let result;
    if (gender === "male") {
        result = 10 * weight + 6.25 * height - 5 * activity + 5;
    } else {
        result = 10 * weight + 6.25 * height - 5 * activity - 161;
    }
    return result;
}

router.get("/", (req, res) => {
    res.render("bmr", {
        cal:0,
        loggedIn: req.isAuthenticated()
    });
});

router.post("/", (req, res) => {
    const weight = parseFloat(req.body.weight);
    const height = parseFloat(req.body.height);
    const age = parseFloat(req.body.age);
    const gender = req.body.sex;
    const activity = parseFloat(req.body.activity);

    const calorie = Math.floor(calculateBMR(weight, height, gender, activity));
    console.log(calorie);
    req.session.calorie = calorie;
    res.render("bmr", {
        cal: calorie || 0,
        loggedIn: req.isAuthenticated()
    });
});

// Exporting router and functions
module.exports = {
    router: router,
    calculateBMR: calculateBMR,
};
