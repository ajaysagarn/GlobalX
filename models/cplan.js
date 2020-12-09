var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var cplanSchema = new mongoose.Schema({
    courseId   : String,
    courseTitle: String,
    category : Number,
    dependants : []
});


module.exports = mongoose.model("courseplan", cplanSchema );