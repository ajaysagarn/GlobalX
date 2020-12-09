var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var allottedCreditscredSchema = new mongoose.Schema({
    courseId   : String,
    CreditName : String,
    CreditCount : Number
});


module.exports = mongoose.model("allotCredit", allottedCreditscredSchema );