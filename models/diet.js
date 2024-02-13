const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
    date: String,
    calorie: Number,
});

module.exports = dietSchema;
