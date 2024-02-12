const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first: String,
    last: String,
    username: String,
    password: String,
    bmi: Number,
    cal: Number,
    weight: Number,
    height: Number,
    gender: String
});

module.exports = userSchema;
