var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var courseSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    experience : {type: Number, required:true },
    credits : String
});

courseSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Course", courseSchema );