var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var associateEnrollSchema = new mongoose.Schema({
    associateId : String,
    compId : String,
    courseId : String,
    assoc_avail_slot : []

});

module.exports = mongoose.model("associateEnroll", associateEnrollSchema );