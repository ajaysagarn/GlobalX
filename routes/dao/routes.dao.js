const express = require('express');
const router = express.Router();

var Courses = require("../../models/course");
var Instructor = require("../../models/instructor");
var Classroom = require("../../models/classroom");
var associateEnrollments = require("../../models/associate_enrollments");
var Associate = require("../../models/associate");
var Batch = require("../../models/batch");

var assoc_availability;

function addAvaiability(avail_slots){
    var i=0;
    avail_slots.forEach( value=>{
        if(value){
            assoc_availability[i++] += 1;
            console.log(assoc_availability);
        }
        else{
            i++;
        }
    })
}

router.get("/getCourses",function(req,res){
    console.log("ajax call for getting courses");
    Courses.find({},function(err,allcourses){
        if(err){
            console.log(err);
        }
        else{
            console.log(allcourses.length);
            res.render("snippets/courseOptions.ejs",{ courses : allcourses}); 
        }
    })
})

router.get("/getInstructor/:instID",function(req,res){
    console.log("ajax call for getting instructor");
    Instructor.findById(req.params.instID,function(err,instructor){
        if(err){
            console.log(err);
        }
        else{
            console.log("retreived instructor"+instructor.name);
            res.send(JSON.stringify(instructor));
        }
    })
});

router.get("/getClassroom/:classID",function(req,res){
    console.log("ajax call for getting classroom");
    Classroom.findById(req.params.classID,function(err,classroom){
        if(err){
            console.log(err);
        }
        else{
            console.log("retreived classroom"+classroom.name);
            res.send(JSON.stringify(classroom));
        }
    })
});

router.get("/getEnrollCount/:courseID",function(req,res){
    assoc_availability = [0,0,0,0,0,0,0,0];
    console.log("courseID:"+req.params.courseID);
    associateEnrollments.find({courseId : req.params.courseID} ,function(err,enrollments){
        if(err){
            console.log(err);
        }
        else{
            //console.log(associateids);
            let count=0;
            if(enrollments.length == 0 ){
                res.send(JSON.stringify(assoc_availability));
            }
            else{
            enrollments.forEach( enrollment => {
                Associate.findById( enrollment.associateId , function(err,associate){
                    if(err){
                        console.log(err);
                    }
                    else{
                        //console.log(associate);
                        addAvaiability(associate.avail_slot);
                        if(++count == enrollments.length){
                            console.log("availability: " + assoc_availability);
                            res.send(JSON.stringify(assoc_availability));
                        }
                    }
                    
                });
            });
        }
        }
    });
});

router.get("/getBatches/:associateid",(req,res)=>{
    console.log("Got ajax call to retreive associate batches");
    console.log(req.params.associateid);
    Batch.find(  {associateId:req.params.associateid },(err,batch)=>{
        if(err){throw err;}
        else{
            console.log(batch);
            res.send(batch);
        }
    } )
})



module.exports = router;