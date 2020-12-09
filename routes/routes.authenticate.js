
const express = require('express');
const router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");


router.use(passport.initialize());
router.use(passport.session());

var company = require("../models/company");
var compCreds = require("../models/comp_creds");
var associate = require("../models/associate");
var assocCreds = require("../models/assoc_creds");

passport.use('company',new LocalStrategy(compCreds.authenticate()));
passport.use('associate',new LocalStrategy(assocCreds.authenticate()));
passport.serializeUser(compCreds.serializeUser() );
passport.deserializeUser(compCreds.deserializeUser());

passport.use(new LocalStrategy(assocCreds.authenticate()));
passport.serializeUser(assocCreds.serializeUser());
passport.deserializeUser( assocCreds.deserializeUser());




router.get("/companyLogin",function(req,res){
    res.render("companyLogin");
});

router.post("/companyRegister",function(req,res){
    compCreds.register(new compCreds({username : req.body.username}), req.body.password, function(err,comp){
        if(err){
            console.log("company signup has failed");
            req.flash("error","Company Signup failed..Username already exists!");
            res.redirect("/companyLogin");
            //return res.render('companyLogin');
        }
        else{
            passport.authenticate('company')(req,res,function(){
                company.create({ name : req.body.name, username: req.body.username },function(err,comp){
                    if(err){
                        console.log(err);
                    }
                    else{
                        var toredirect = "/company/"+comp.username ;
                        console.log(toredirect);
                        req.flash("success","Successfully created Company Account!");
                        res.redirect(toredirect);    
                    }
                });
            });
        }
        
    });
});

router.post("/company",passport.authenticate('company'),function(req,res){
    console.log("authenticated");
    let toredirect = "/company/"+req.body.username;
    console.log(toredirect);
    req.flash("success","Logged in Successfully")
    res.redirect(toredirect);
});

router.get("/companyLogout",function(req,res){
    req.logOut();
    req.flash("success","Logged out successfully!")
    res.redirect("/companyLogin");
});

//auth function



//------------associate auth---------------------------------
router.get("/associateLogin",function(req,res){
    
       company.find({},function(err,comp){
           if(err){
               console.log(err);
           }
           else{
               res.render("associateLogin", {allCompanies : comp});
              // console.log(comp);
           }
       })    
});

router.post("/associateRegister",function(req,res){
   assocCreds.register(new assocCreds({username : req.body.username}), req.body.password, function(err,comp){
        if(err){
            console.log("associate signup has failed");
            req.flash("error","Associate sign up failed!..Username already exists!");
            return res.render('associateLogin');
        }
        passport.authenticate("associate")(req,res,function(){
            company.findById(req.body.Company,function(err,assocComp){
                if(err){throw err;}
                else{
                    let status = assocComp.status;
                    if(!status){
                        associate.create({ 
                            name : req.body.name, 
                            username: req.body.username , 
                            company : req.body.Company,
                            companyName: assocComp.name,
                            avail_slot : [true,true,true,true,true,true,true,true],
                            experience: req.body.experience,
                             },function(err,assoc){
                            if(err){
                                req.flash("error","Authentication Error");
                                console.log(err);
                                res.redirect("/associateLogin");
                            }
                            else{
                                var toredirect = "/associate/"+assoc.username ;
                                console.log(toredirect);
                                res.redirect(toredirect);    
                            }
                        });
                    }
                    else{
                        associate.create({ 
                            name : req.body.name, 
                            username: req.body.username , 
                            company : req.body.Company,
                            companyName: assocComp.name,
                            ranking : 6,
                            avail_slot : [true,true,true,true,true,true,true,true],
                            experience: req.body.experience,
                             },function(err,assoc){
                            if(err){
                                req.flash("error","Authentication Error");
                                console.log(err);
                                res.redirect("/associateLogin");
                            }
                            else{
                                var toredirect = "/associate/"+assoc.username ;
                                console.log(toredirect);
                                res.redirect(toredirect);    
                            }
                        });
                    }
                    
                }  
            })
           
        });
    });
});

router.post("/associate",passport.authenticate("associate"),function(req,res){
    console.log("authenticated");
    let toredirect = "/associate/"+req.body.username;
    console.log(toredirect)
    res.redirect(toredirect);
});

router.get("/associateLogout",function(req,res){
    req.logOut();
    res.redirect("/associateLogin");
});

module.exports = router;