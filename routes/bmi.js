const express = require('express');
const router = express.Router();

var calorie = 0;
var bmi = 0;

// functions for calculating bmi and required cal intake
function calculateBMI(weight, height) {
    var result = weight / (((height / 100) * height) / 100);
    result = Math.round((result + Number.EPSILON) * 100) / 100
    return result;
}

function calculateBMR(weight, height, gender, k) {
    var result;
    if (gender == "male") {
        result = 10 * weight + 6.25 * height - 5 * k + 5;
    } else {
        result = 10 * weight + 6.25 * height - 5 * k - 161;
    }
    return result;
}

router.get("/", function(req, res) {
    res.render("bmi", {
        cal: calorie,
        bmi: bmi
    });
});

router.post("/", function(req, res) {
    var weight = parseFloat(req.body.weight);
    var height = parseFloat(req.body.height);
    var weight1 = parseFloat(req.body.weight1);
    var height1 = parseFloat(req.body.height1);
    var age = parseFloat(req.body.age);
    var gender = req.body.sex;
    var k = parseFloat(req.body.activity);

    calorie = Math.floor(calculateBMR(weight, height, gender, k));
    bmi = calculateBMI(weight1, height1);

    res.redirect("/bmi");
});

module.exports = {
    router: router,
    calculateBMI: calculateBMI,
    calculateBMR: calculateBMR
}
