var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var assoc_credSchema = new mongoose.Schema({
    associd   : String,
    username : String,
    password : String
});


assoc_credSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("assoc_cred", assoc_credSchema );