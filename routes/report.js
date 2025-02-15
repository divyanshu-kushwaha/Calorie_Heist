require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const _ = require('lodash');

const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
};

router.get("/", (req,res)=>{
    res.render("report",{
        nutrientData: null,
        loggedIn: req.isAuthenticated()
    })
})

router.post("/", (req,res)=>{
    User.findById(req.user._id, (err, foundUser)=>{
        if(err){
            return console.log("Error locating user, Login again!");
        }
        else{
            if(foundUser.nutrients){
                const reportTimePeriod = req.body.reportTimePeriod;
                const today = getDate();
                let filteredNutrients;

                if (reportTimePeriod === "today") {
                    filteredNutrients = foundUser.nutrients.get(today);
                } 
            
                // else if (reportTimePeriod === "last7days") {
                //     filteredNutrients = _.pickBy(foundUser.nutrients, (value, key) => {
                //         const date = new Date(key.split('/').reverse().join('-'));
                //         const lastWeek = new Date();
                //         lastWeek.setDate(lastWeek.getDate() - 7);
                //         return date >= lastWeek;
                //     });
                // } else if (reportTimePeriod === "last1month") {
                //     filteredNutrients = _.pickBy(foundUser.nutrients, (value, key) => {
                //         const date = new Date(key.split('/').reverse().join('-'));
                //         const lastMonth = new Date();
                //         lastMonth.setMonth(lastMonth.getMonth() - 1);
                //         return date >= lastMonth;
                //     });
                // } 
                else if (reportTimePeriod === "alltime") {
                    filteredNutrients = foundUser.nutrients;
                }
                console.log("Backend wala:");
                console.log(filteredNutrients);
                res.render("report",{
                    nutrientData: filteredNutrients,
                    loggedIn: req.isAuthenticated()
                })
            }
            else{
                return console.log("Nutrients record empty.")
            }
        }
    })
})

module.exports = router;