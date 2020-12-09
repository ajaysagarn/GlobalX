var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var instructorSchema = new mongoose.Schema({
    name : {type: String, unique:true },
    avail_slot : [] 

});

instructorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("instructor", instructorSchema );