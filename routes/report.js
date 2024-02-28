require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");

const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
};

router.get("/", (req,res)=>{
    res.render("report",{
        nutrients: null,
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
                const today = getDate();
                const nutrients = foundUser.nutrients.get(today);
                res.render("report",{
                    nutrientData: nutrients,
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