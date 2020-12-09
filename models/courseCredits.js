var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var courseCreditsSchema = new mongoose.Schema({
    courseId   : String,
    CreditName : String,
    CreditCount : Number
});


module.exports = mongoose.model("courseCredit", courseCreditsSchema );