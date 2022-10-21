const express = require('express');
const router = express.Router();
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

var nutrients = 0;
const dietSchema = new mongoose.Schema({
    date: String,
    calorie: Number,
}); 
router.get("/", function(req, res) {
    res.render("meal", {
        nutrients: nutrients
    });
});

router.post("/", function(req, res) {
    var currUserObject = req.user;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + "/" + dd + "/" + yyyy;
    //API part
    var food = req.body.food;
    var API_KEY = process.env.API_KEY;
    const url1 =
        "https://api.spoonacular.com/recipes/complexSearch?query=" +
        food +
        "&apiKey=" +
        API_KEY +
        "&number=1&addRecipeNutrition=true";

    //HTTPS get
    https.get(url1, function(response) {
        console.log(response.statusCode);
        var chunks = [];
        response.on("data", function(chunk) {
            chunks.push(chunk);
        });
        response.on("end", function(chunk) {
            var body = Buffer.concat(chunks);
            var data = JSON.parse(body);
            var result2 = Math.floor(data.results[0].nutrition.nutrients[0].amount);
            nutrients = result2;
        });
    });

    res.redirect("/meal");
});
module.exports = router;
