var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var associateSchema = new mongoose.Schema({
   name : String,
   username : String,
   company : String,
   companyName : String,
   experience   : Number,
   avail_slot : { type:Array , default : [true,true,true,true,true,true,true,true] },    
   ranking : { type : Number, default : 3 },
   first : { type:Boolean , default:true }
});

module.exports = mongoose.model("associate", associateSchema );