var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var instructorCourseSchema = new mongoose.Schema({
    instructorId : String,
    courseId : String 

});

module.exports = mongoose.model("instructorCourse", instructorCourseSchema );