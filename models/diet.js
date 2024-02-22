const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
    calories: Number,
    servingSize: Number,
    fat: Number,
    saturatedFat: Number,
    protein: Number,
    cholesterol : Number,
    carbohydrates: Number,
    fiber: Number,
    sugar: Number,
});

module.exports = dietSchema;
