var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var batchSchema = new mongoose.Schema({
    associateId : [{
        type : mongoose.Schema.Types.ObjectId,
        ref  : "associate"
    }],
    instructorId : String,
    courseTitle : String,
    courseId : String,
    classId : String,
    slotno : Number,
    started : false

});

module.exports = mongoose.model("batch", batchSchema );