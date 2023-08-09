require("dotenv").config();
const express = require("express");
const router = express.Router();
const request = require("request");
const https = require("https");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');



module.exports = router;
