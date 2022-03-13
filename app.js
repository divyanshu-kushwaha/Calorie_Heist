const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

var calorie=0;
var bmi=0;
var nutrient=0;

app.get("/", function(req, res) {
  res.render("dashboard");
});
//
// app.post("/" , function(req,res){
//
// });

app.get("/bmi", function(req, res) {
  res.render("bmi" , {cal:calorie , bmi:bmi, nutrient:nutrient});
});

app.post("/bmi" , function(req,res){
    var weight = parseFloat(req.body.weight);
    var height = parseFloat(req.body.height);
    var weight1 = parseFloat(req.body.weight1);
    var height1 = parseFloat(req.body.height1);
    var age = parseFloat(req.body.age);
    var gender = req.body.sex;
    var k = parseFloat(req.body.activity);
    var result
    var result1 = weight1 / (height1/100 * height1/100);
    if(gender == "male"){
      result = 10*weight + 6.25*height - 5*k +5
    }

    else result = 10*weight + 6.25*height - 5*k - 161
    calorie = Math.floor(result)
    bmi = result1;

    //API part
    var food = req.body.food;
    var API_KEY = process.env.API_KEY;
    const url = "https://api.spoonacular.com/recipes/complexSearch?query=" + food + "&apiKey=" + API_KEY + "&number=1&addRecipeNutrition=true";
    https.get(url, function (response) {
      console.log(response.statusCode);
      var chunks = [];
        response.on("data", function (chunk) {
          chunks.push(chunk);
        });
        response.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          var data = JSON.parse(body);
          var result2 = Math.floor(data.results[0].nutrition.nutrients[0].amount);
          nutrient = result2
    });
    })
    res.redirect("/bmi");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
