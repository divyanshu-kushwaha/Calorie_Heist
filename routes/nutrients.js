require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const request = require("request");

const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
};

function mergeNutrients(prevNutrients, foodItemList){
    foodItemList.forEach((foodItem)=>{ 
        prevNutrients.calories += foodItem.calories;
        prevNutrients.servingSize += foodItem.serving_size_g 
        prevNutrients.fat += foodItem.fat_total_g
        prevNutrients.saturatedFat += foodItem.fat_saturated_g
        prevNutrients.protein += foodItem.protein_g 
        prevNutrients.cholesterol += foodItem.cholesterol_mg 
        prevNutrients.fiber += foodItem.fiber_g 
        prevNutrients.carbohydrates += foodItem.carbohydrates_total_g
        prevNutrients.sugar += foodItem.sugar_g
    })
    return prevNutrients;
}

function getFoodItemList(food) {
    const API_KEY = process.env.API_KEY;
    
    return new Promise((resolve, reject) => {
        request.get(
            {
                url: "https://api.calorieninjas.com/v1/nutrition?query=" + food,
                headers: {
                    "X-Api-Key": API_KEY,
                },
            },
            function (error, response, body) {
                if (error) {
                    reject("Request failed: " + error);
                } else if (response.statusCode != 200) {
                    reject("Error: " + response.statusCode + " " + body.toString("utf8"));
                } else {
                    resolve(JSON.parse(body).items);
                }
            }
        );
    });
}

async function updateNutrients(userId, foodItemList) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found.");
            return null;
        }

        const today = getDate();
        const initialNutrients = {
            "calories": 0,
            "servingSize": 0,
            "fat": 0,
            "saturatedFat": 0,
            "protein": 0,
            "cholesterol": 0,
            "carbohydrates": 0,
            "fiber": 0,
            "sugar": 0,
        };

        var prevNutrients = initialNutrients;
        if(user.nutrients && user.nutrients.has(today)){
            prevNutrients = user.nutrients.get(today);
        }
        
        const mergedNutrients = mergeNutrients(prevNutrients,foodItemList);

        // Building the map<Date, nutrientsDetailsJSON> to store in DB
        const finalNutrients = {};
        finalNutrients[today] = mergedNutrients;

        // Updating the nutrients in DB
        user.nutrients = finalNutrients;
        const updatedUser = await user.save();
        console.log('Nutrients updated successfully:', updatedUser);
        return updatedUser;
    } 
    catch (error) {
        console.error("Error updating nutrients:", error);
        throw error;
    }
}

router.post("/add", async(req, res) => {
    const currUserObj = req.user;
    const food = req.body.food;
    const foodItemList = await getFoodItemList(food);
    User.findById(currUserObj._id, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                updateNutrients(foundUser, foodItemList);
                res.render("add-meal", {
                    foodItemList,
                    loggedIn: req.isAuthenticated(),
                });
            }
        }
    });
});

router.get("/", function (req, res) {
    res.render("nutrients", {
        foodItemList: null,
        loggedIn: req.isAuthenticated(),
    });
});

router.post("/", async function (req, res) {
    const food = req.body.food;
    const foodItemList = await getFoodItemList(food);
    res.render("nutrients", { foodItemList, loggedIn: req.isAuthenticated() });
});

router.get("/add", (req, res) => {
    res.render("add-meal", {
        foodItemList: null,
        loggedIn: req.isAuthenticated(),
    });
});

module.exports = router;
