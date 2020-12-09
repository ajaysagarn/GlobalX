var express = require("express");
var app = express();
var port = 3001;
var bodyParser = require("body-parser");
//var mongoose = require("mongoose");
var methodOverride = require("method-override");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var flash = require("connect-flash");
const ejsLint = require('ejs-lint');


var passportLocalMongoose = require("passport-local-mongoose");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
app.set("view engine","ejs");
//app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(flash());



//---------schema variables---------------------------------------------------------------

var Course = require("./models/course.js");
var compCreds = require("./models/comp_creds.js");
var company = require("./models/company.js");
var assocCreds = require("./models/assoc_creds");
var associate = require("./models/associate.js");
var uniqueValidator = require('mongoose-unique-validator');

//---------end schema variables-------------------------------------------------------------------




//mongoose.connect("mongodb://localhost/globalxdb",{ useNewUrlParser: true });

app.use(require("express-session")({
    secret : "Global X is the best training company",
    resave : false,
    saveUninitialized : false
}));

app.use(function(req,res,next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});

// app.use(passport.initialize());
// app.use(passport.session());


// passport.use('company',new LocalStrategy(compCreds.authenticate()));
// passport.use('associate',new LocalStrategy(assocCreds.authenticate()));
// passport.serializeUser(compCreds.serializeUser() );
// passport.deserializeUser(compCreds.deserializeUser());

// passport.use(new LocalStrategy(assocCreds.authenticate()));
// passport.serializeUser(assocCreds.serializeUser());
// passport.deserializeUser( assocCreds.deserializeUser());


//---------------------- DBtest-----------------

// var nCourse = new Course({
//     title : "c++",
//     experience : 0,
//     credits : 25
// });

// nCourse.save(function(err,course){
//     if(err){
//         console.log("error");
//     }
//     else{
//         console.log(course);
//     }
// });

//-------------------------------------------


app.get("/",function(req,res){
      res.render("homepage");
        
});
//admin home
app.get("/admin",function(req,res){
    console.log("here");
    res.render("adminHome.ejs");
});

app.get("/company",function(req,res){
    res.render("comp_login");
});

app.get("/associate",function(req,res){
    res.render("assoc_login");
});



//========================admin routes start here=========================================================================================

var adminRoutes = require("./routes/admin/routes.admin");
var companyRoutes = require("./routes/company/routes.company");
var associateRoutes = require("./routes/associate/routes.associate");
var authenticateRoutes = require("./routes/routes.authenticate");
var daoroutes = require("./routes/dao/routes.dao.js");

// var seedDB = require("./seedDB");
// app.use(seedDB);

app.use(adminRoutes);
app.use(companyRoutes);
app.use(associateRoutes);
app.use(authenticateRoutes);
app.use(daoroutes);




//========================admin routes end here============================================================================================
//--------------------------authentication routes------------------------------------------------------------------------------------------





//========================Company routes start here========================================================================================



//============================================associate routes start here================================================================




//=========================================================================================================================================
//this is the default route
app.get("*",function(req,res){
    res.render("Notfound");
      
});

// app.post("*",function(req,res){
//     res.render("Notfound");
      
// });

app.put("*",function(req,res){
    res.render("Notfound");
      
});

app.delete("*",function(req,res){
    res.render("Notfound");
      
});

app.listen(port,function(){
    console.log("Server started");
});