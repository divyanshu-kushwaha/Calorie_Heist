const express = require("express");
const router = express.Router();

// Functions for calculating BMI and required caloric intake
function calculateBMI(weight, height) {
    const result = weight / (((height / 100) * height) / 100);
    return Math.round(result * 100) / 100;
}

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
    res.render("bmi", {
        cal: req.session.calorie || 0,
        bmi: req.session.bmi || 0,
    });
});

router.post("/", (req, res) => {
    const weight = parseFloat(req.body.weight);
    const height = parseFloat(req.body.height);
    const age = parseFloat(req.body.age);
    const gender = req.body.sex;
    const activity = parseFloat(req.body.activity);

    const calorie = Math.floor(calculateBMR(weight, height, gender, activity));
    const bmi = calculateBMI(weight, height);

    req.session.calorie = calorie;
    req.session.bmi = bmi;

    res.redirect("/bmi");
});

// Exporting router and functions
module.exports = {
    router: router,
    calculateBMI: calculateBMI,
    calculateBMR: calculateBMR,
};
