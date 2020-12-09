var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var classroomSchema = new mongoose.Schema({
    name : {type:String, unique:true },
    avail_slot : [] 

});

classroomSchema.plugin(uniqueValidator);
module.exports = mongoose.model("classroom", classroomSchema );