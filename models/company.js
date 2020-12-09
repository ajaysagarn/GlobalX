var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var companySchema = new mongoose.Schema({
    name : String,
    username : String,
    
    status    : { type : Boolean  , default : false }

});

module.exports = mongoose.model("Company", companySchema );