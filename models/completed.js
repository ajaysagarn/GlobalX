var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var CompletedSchema = new mongoose.Schema({
    CourseId : String,
    CourseTitle : String,
    associateId : String,
    assocName : String,
    CompanyId : String,
    CompanyName : String,
});

module.exports = mongoose.model("Completed", CompletedSchema );