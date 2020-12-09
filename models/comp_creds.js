var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var comp_credSchema = new mongoose.Schema({
    compid   : String,
    username : String,
    password : String
});


comp_credSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Comp_cred", comp_credSchema );