var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var associateCreditscredSchema = new mongoose.Schema({
    associateId   : String,
    CreditName : String,
    CreditCount : Number
});


module.exports = mongoose.model("associateCredit", associateCreditscredSchema );