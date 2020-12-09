var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var companyEnrollSchema = new mongoose.Schema({
    compId : String,
    courseId : String

});

module.exports = mongoose.model("CompanyEnroll", companyEnrollSchema );
