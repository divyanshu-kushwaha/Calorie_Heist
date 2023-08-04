require("dotenv").config();
const express = require("express");
const router = express.Router();
const request = require("request");
const https = require("https");
const passport = require("passport");
const bodyParser = require("body-parser");

router.get("/", function (req, res){
    res.render('meal', { foodItemList: null }); // Initialize jsonData with null
});

router.post("/", function (req, res) {
    const food = req.body.food;
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
                    const foodItemList = JSON.parse(body).items; // Parse the JSON response
                    res.render('meal', { foodItemList }); // Render meal.ejs with jsonData
                }
        }
    );
});

module.exports = router;
