const express = require('express');
const router = express.Router();
var Course = require("../../models/course");
var methodOverride = require("method-override");
var companyEnrollments = require("../../models/company_enrollments");
var associateEnrollments = require("../../models/associate_enrollments");
var allottedCredits = require("../../models/allotedCredits");
var requiredCredits = require("../../models/courseCredits");
var Instructor = require("../../models/instructor");
var instructorCourses = require("../../models/instructorCourses");
var Classroom = require("../../models/classroom");
var Batch = require("../../models/batch");
var Associate = require("../../models/associate");
var AssociateCredit = require("../../models/associateCredits");
var Company = require("../../models/company");
var Complete = require("../../models/completed");
router.use(methodOverride("_method"));


function isCreditRequired(credname) {
    if (credname == "none") {
        console.log("cred name is none.. no req credits");
        return false;
    }
    return true;
}

function removeEnrollmentAndUpdateSlot(associd,courseid, slot ){
    associateEnrollments.findOneAndDelete({associateId:associd ,courseId : courseid},function(err, removed_enroll){
        if(err){
            console.log(err);
        }
        else{
            console.log("removed enrollment:"+removed_enroll);
            let slotarraystr = `avail_slot.${slot}`;
            Associate.findByIdAndUpdate( removed_enroll.associateId , {[slotarraystr] : false }, function(err,assoc){
                if(err){ throw err ; }
                slotarraystr = `assoc_avail_slot.${slot}`;
                associateEnrollments.updateMany({ associateId : removed_enroll.associateId }, {[slotarraystr] : false}, function(err , done){
                    if(err){ throw err ; }
                   // removed();

                })
            });
            
        }
    })
}

function updateCreditsAndSlot(associateId , courseId , slotno , updated){

    let slotarraystr = `avail_slot.${slotno}`;
            Associate.findByIdAndUpdate( associateId , {[slotarraystr] : true }, function(err,assoc){
                if(err){ 
                    throw err ; 
                }
                else{
                    slotarraystr = `assoc_avail_slot.${slotno}`;
                    associateEnrollments.updateMany({ associateId : associateId }, {[slotarraystr] : true }, function(err , done){
                    if(err){ throw err ; }
                    else{
                        console.log("updated slot details of associate and assocenrollments");
                        //allotCourseCredits();
                        allottedCredits.findOne({courseId : courseId },function(err,allotcredit){
                            if(err){
                                console.log(err);
                            }
                            else{
                                AssociateCredit.findOne({ CreditName : allotcredit.CreditName , associateId : associateId  },function(err,assoccred){
                                    if(err){
                                        console.log(err);
                                    }
                                    else{
                                        if(!(assoccred == null )){
                                            let creditCount = allotcredit.CreditCount;
                                            console.log(creditCount);
                                            console.log(associateId);
                                            AssociateCredit.findOneAndUpdate( {CreditName : allotcredit.CreditName , associateId : associateId} , { $inc: { CreditCount : creditCount } },function(err,updatedcred){
                                                if(err){ throw err; }
                                                console.log("updated associate credit:"+updatedcred);
                                                updated();
                                            });
                                        }
                                        else{
                                            AssociateCredit.create({associateId   : associateId,
                                                                    CreditName : allotcredit.CreditName,
                                                                    CreditCount : allotcredit.CreditCount},function(err,newcredit){
                                                                        if(err){throw err;}
                                                                        console.log("gave associate credit:"+newcredit);
                                                                        updated();
                                                                    });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    
                });
                }
                
            });       
    
}

function rankingCheck(){
    Company.find({},function(err,companies){
        companies.forEach(comp => {
            associateEnrollments.find({compId : comp._id},function(err,enrollments){
                if(err){
                    console.log(err);
                }
                else{
                    let status = comp.status;
                    if(enrollments.length >= 10){
                        console.log("[keyRank]enrollments > 10");
                        if(!status){
                            let q = Company.where({ _id : comp._id});
                            q.update({ $set: { status : true }}).exec();
                            Associate.updateMany({ company : comp._id },{ $inc: { ranking : 3 } },function(err, updatedassoc){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    console.log("increased ranking of associates");
                                }
                            });
                        }
                    }
                    else if(enrollments.length < 10){
                        console.log("[keyRank]enrollments < 10");
                        if(status){
                            let q = Company.where({ _id : comp._id});
                            q.update({ $set: { status : false }}).exec();
                            Associate.updateMany({ company : comp._id },{ $inc: { ranking : -3 } },function(err, updatedassoc){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    console.log("decreased ranking of associates");
                                }
                            });
                        }
                    }
                }
            });
        });
    });
}

function checkFirstandReduceRanking(batch){
    console.log("[checking first--------------------]")
    console.log("[checking first]batch:"+batch);
    return new Promise((resolve,reject)=>{
        // Batch.findById(batchid,function(err,batch){
        //     if(err){ reject() }
        //     else{
                console.log("[checking first]batch:"+batch);
                let associates = batch.associateId;  
               // CurrBatch = batch;
                for(let i=0;i< associates.length ; i++){
                    Associate.findById(associates[i],function(err,associate){
                        if(err){ throw err;}
                        else{
                            if(associate.first == true){
                                Associate.findByIdAndUpdate(associate._id, {$inc: { ranking : -3 }, first : false},function(err,updated){
                                    if(err){ throw err;}
                                    else{
                                        console.log("[checking first]first course taken reduced ranking"+updated);
                                    }
                                })
                            }
                            if(i+1 == associates.length){
                                resolve();
                            }
                        }
                    });                    
                }
                //resolve();
            
        
    })
    
}

function addBatchtoComplete(batchid){
    return new Promise((resolve,reject)=>{
        Batch.findById(batchid,(err,batch)=>{
            if(err){ throw err;}
            else{
                let count = 0;
                batch.associateId.forEach(assocId=>{
                    Associate.findById(assocId,(err,assoc)=>{
                        Complete.create({CourseId : batch.courseId,
                        CourseTitle : batch.courseTitle,
                        associateId : assoc._id,
                        assocName : assoc.name,
                        CompanyId : assoc.company,
                        CompanyName: assoc.companyName},(err,complete)=>{
                            if(err){ throw err;}
                            console.log("added associate to complete!");
                            if(++count == batch.associateId.length){
                                resolve();
                            }
                        });
                    });
                });
            }
        });
    });
}


//courses option
router.get("/admin/course", function (req, res) {
    Course.find({}, function (err, allCourses) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("adminCourses", { gcourses: allCourses });
        }
    })

});
//edit a course
router.put("/admin/course/:id", function (req, res) {
    let exp = req.body.experience;
    if (req.body.expType == '2') {
        exp = exp / 12;
        console.log("exp inside if:" + exp);
    }
    Course.findByIdAndUpdate(req.params.id, {title: req.body.title,
                                            experience: Number(exp),
                                            credits: req.body.reqCredName + "-" + req.body.reqCredCount},
                                             function (err, editedCourse) {
                    if (err) {
                         req.flash("error","Unable to Edit Course!")
                        console.log(err);
                        }
                    else {
                        req.flash("success","Course edited Successfully!")
                        res.redirect("/admin/course");
                        console.log(editedCourse);
                    }
        })
})
//delete a course
router.delete("/admin/course/:id", function (req, res, next) {
    companyEnrollments.deleteMany({ courseId: req.params.id }, function (err, deletedenroll) {
        console.log("deleted :" + deletedenroll);
        if (err) {
            console.log(err);
        }
        else {
            associateEnrollments.deleteMany({ courseId: req.params.id }, function (err, deletedassocenrolls) {
                if (err) { throw err; }
                else {
                    rankingCheck();
                    allottedCredits.deleteMany({courseId : req.params.id},()=>{
                        requiredCredits.deleteMany({courseId:req.params.id},()=>{
                            Course.findByIdAndDelete(req.params.id, function (err, deletedCourse) {
                                if (err) {
                                    req.flash("error", "Unable to Delete Course!")
                                    res.redirect("/admin/course");
                                    console.log(err);
                                }
                                else {
                                    req.flash("success", "Course deleted Successfully!")
                                    res.redirect("/admin/course");
                                }
                            })
                        })
                    })
                    
                }
            })
        }
    });

});
//create course form
router.get("/admin/course/cform", function (req, res) {
    allottedCredits.find().distinct("CreditName", function (err, creds) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(creds);
            res.render("newCourseForm", { credits: creds })
        }
    })
    //res.render("newCourseForm");
});
//edit course form
router.get("/admin/course/eform/:id", function (req, res) {
    Course.findById(req.params.id, function (err, editCourse) {
        if (err) {
            console.log(err);
        }
        else {
            allottedCredits.find().distinct("CreditName", function (err, creds) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("editCourseForm", { editCourse: editCourse, credits: creds });
                }
            })

        }
    })

})


router.get("/admin/course/:courseid/details",(req,res)=>{
    associateEnrollments.find({courseId:req.params.courseid},{associateId:1 , _id: 0},(err,enrolls)=>{
        if(err){throw err;}
        
        let associateids = enrolls.map(function (ele) { return ele.associateId });
        console.log("[details]"+associateids);
        Associate.find( {_id : {$in : associateids}},(err,enrolledassociates)=>{
            if(err){throw err;}
            Complete.find({CourseId:req.params.courseid},(err,completed)=>{
                if(err){ throw err;}
                Batch.find({courseId : req.params.courseid},(err,Batch)=>{
                    if(err){ throw err;}
                    Course.findById(req.params.courseid,(err,course)=>{
                        if(err){ throw err;}
                        requiredCredits.find({courseId : req.params.courseid},(err,reqCreds)=>{
                            allottedCredits.find({courseId : req.params.courseid},(err,allotCreds)=>{
                                res.render("adminCourseDetails",{course:course , 
                                                                enrolls : enrolledassociates , 
                                                                completed:completed , 
                                                                Batches:Batch,
                                                                reqCredits : reqCreds,
                                                                allotcreds : allotCreds});
                            })
                        })
                        
                    })                   
                })
            })
        })
        
    })
});

//add course to db
router.post("/admin/course", function (req, res) {
    console.log(req.body.title);
    console.log(req.body.experience);
    console.log(req.body.credits);
    var exp = req.body.experience;
    if (req.body.expType == '2') {
        exp = exp / 12;
        console.log("exp inside if:" + exp);
    }
    console.log("finalexp=" + exp);
    Course.create({

        title: req.body.title,
        experience: Number(exp),
        credits: req.body.reqCredName + "-" + req.body.reqCredCount
    }, function (err, course) {
        console.log("here");
        if (err) {
            req.flash("error","Unable to create Course, Invalid input or Course already exists!");
                    res.redirect("/admin/course");
            console.log("couldnt create course!!");
        }
        else {
            console.log("course created");
            console.log(course);
            if (isCreditRequired(req.body.reqCredName)) {
                if (!((req.body.reqCredCount == null) || (req.body.reqCredCount == undefined) || (req.body.reqCredCount == 0))) {
                    requiredCredits.create({
                        courseId: course._id,
                        CreditName: req.body.reqCredName,
                        CreditCount: req.body.reqCredCount
                    });
                }
                else {
                    console.log("credit count is null or 0");
                }
            }
            allottedCredits.create({
                courseId: course._id,
                CreditName: req.body.allotCredName,
                CreditCount: req.body.allotCreditCount
            }, function (err, allotted) {
                if (err) {
                    req.flash("error","Unable to create Course, Invalid input or Course already exists!");
                    res.redirect("/admin/course");
                    console.log(err);
                }
                else {
                    req.flash("success","Successfully Added Course");
                    res.redirect("/admin/course");
                }
            });
        }
    });

    //res.redirect("/admin/course");
});

router.get("/admin/schedule", function (req, res) {
    Course.find({}, function (err, allcourses) {
        if (err) {
            console.log(err);
        }
        else {
            schedulecourses = [];
            function allDone() {
                // res.send(schedulecourses);
                //req.flash("error", "None of the Courses have enough enrollments to schedule a batch!");
                Batch.find({},function(err,batches){
                    if(err){ throw err;}
                    else{
                        res.render("scheduleCourses", { courses: schedulecourses , batches : batches });
                    }
                });
               
            }
            if (allcourses.length == 0) {
                req.flash("error", "None of the Courses have enough enrollments to schedule a batch!");
                allDone();
            }
            let count = 0;
            //console.log("no of courses:" + allcourses.length);
            allcourses.forEach(course => {
                associateEnrollments.find({ courseId: course._id }, function (err, enrollments) {
                    count += 1
                    //console.log("no of enrollments:" + enrollments.length);
                    if (err) {
                        console.log(err);
                    }

                    else {
                        if (enrollments.length >= 5) {
                           // console.log("enrollments gte 5");
                            schedulecourses.push(course);
                        }
                        else {
                            //console.log("enrollments less than 5 , count:" + count);
                        }
                        if (count == allcourses.length) {
                            allDone();
                        }
                    }
                })
            })
        }
    })
    //res.render("scheduleCourses");
})

router.get("/admin/schedule/:id", function (req, res) {
    associateEnrollments.find({ courseId: req.params.id }, function (err, enrollments) {
        if (err) {
            console.log(err);
        }
        else {
            instructorCourses.find({ courseId: req.params.id }, function (err, instIds) {
                if (err) {
                    console.log(err);
                }
                else {
                    let instructors = [];
                    function allDone() {
                        Classroom.find({}, function (err, classrooms) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                Batch.find({courseId : req.params.id},function(err,batch){
                                    if(err){throw err;}
                                    Course.findById(req.params.id,(err,course)=>{
                                        if(err){ throw err;}
                                        else{                                           
                                        res.render("batchScheduler", { 
                                        course : course,
                                        enrolls: enrollments, 
                                        instructors: instructors, 
                                        classroom: classrooms,
                                        batches : batch  });
                                        }
                                    })
                                })
                                
                            }
                        });

                    }
                    console.log("[instrucctors]"+instIds);
                    if (instIds.length == 0) {
                        allDone();
                    }
                    else {
                        instIds.forEach(instr => {
                            Instructor.findById(instr.instructorId, function (err, instructor) {
                                console.log("[pushing to instructors:]"+instructor);
                                instructors.push(instructor);
                                if (instructors.length == instIds.length) {
                                    allDone();
                                }
                            });
                        });
                    }
                }
            })

        }
    })

});

router.get("/admin/resource", function (req, res) {
    Course.find({}, function (err, allcourses) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("resourcesForm", { courses: allcourses });
        }
    })

})

router.post("/admin/resource/instructor", function (req, res) {
    console.log(req.body.instName);
    Instructor.create({ name: req.body.instName, avail_slot: [true, true, true, true, true, true, true, true] }, function (err, instructor) {
        if (err) {
            console.log(err);
            res.send("Instructor "+req.body.instName+" already exists!");
        }
        else {
            console.log("instructor" + instructor.name + "created");
            var count = 0;
            req.body.course.forEach(course => {
                instructorCourses.create({ instructorId: instructor._id, courseId: course }, function (err, instcourse) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("instructor course added");
                        count++;
                        if (count == req.body.course.length) {
                            res.send("successfully created Instructor");
                        }
                    }
                });
            });
        }
    });

});

router.post("/admin/resource/classroom", function (req, res) {
    console.log("classroom =" + req.body.className);
    Classroom.create({ name: req.body.className, avail_slot: [true, true, true, true, true, true, true, true] }, function (err, classroom) {
        if (err) {
            console.log(err);
            res.send("classroom "+req.body.className+" already exists");
        }
        else {
            res.send("Classroom " + classroom.name + " added successfully");
        }
    });

});

router.post("/admin/scheduleBatch", function (req, res) {
    console.log("sent ajax to schedule batch");
    console.log(req.body);
    let slot = req.body.slot;
    let arraystr = `assoc_avail_slot.${slot}`;
    console.log(arraystr);
    associateEnrollments.find({ courseId: req.body.courseId, [arraystr]: true }, { associateId: 1, _id: 0 }, function (err, availenrolls) {
        if (err) {
            console.log(err);
        }
        else {
            let enrolls = [];
            enrolls = availenrolls.map(function (ele) { return ele.associateId });
            console.log(availenrolls);
            console.log("mapped avail enrolls:" + enrolls);
            Course.findById(req.body.courseId,function(err,bcourse){
                if(err){ throw err;}
                else{
                    var batch = new Batch({
                        instructorId: req.body.instructor,
                        courseTitle : bcourse.title,
                        courseId: req.body.courseId,
                        classId: req.body.class,
                        slotno: slot,
                        started: false
                    });
                    console.log("batch Created :" + batch);
                    Associate.find({ _id: { $in: enrolls } }).sort( {ranking : -1}).exec(function (err, associates) {
                        if (err) {
                            console.log(err);
                        }
                        else {  
                                console.log(associates);
                                let count=0;
                                for(let i=0; i < req.body.batchsize ; i++){
                                // associates.forEach(associate => {
                                    console.log("pushing associate");
                                batch.associateId.push(associates[i]);
                                removeEnrollmentAndUpdateSlot(associates[i]._id , req.body.courseId , slot );
                                console.log("[removed] count:"+count);
                                console.log("[removed] lrngth:"+associates.length);
                                console.log("[batch Size] :"+req.body.batchsize);
                                 if((++count == associates.length) || (count == req.body.batchsize) ){
                                    // savethebatch();
                                    //rankingCheck();
                                }
                                console.log(batch);
                                
                                
                                //ended here removed is not a function
                            }
                            savethebatch();
                            rankingCheck();
                        }
                      
                    });
                }
                async function savethebatch(){
                    batch.save();
                    let slotarraystr = `avail_slot.${slot}`;
                    Instructor.findByIdAndUpdate(batch.instructorId,{ [slotarraystr] : false },function(err,instr){
                        if(err){
                            console.log(err);
                        }
                        else{
                            //instr.avail_slot[slot] = false;
                            console.log("-------insts----"+instr);
                            //instr.save();
                            Classroom.findByIdAndUpdate(batch.classId,{ [slotarraystr] : false },function(err,classr){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    //classr.avail_slot[slot] = false;
                                    console.log("-------class----"+classr);
                                    //classr.save();
                                } 
                            });    
                        }    
                        
                    });
                    let check = checkFirstandReduceRanking(batch);
                    await check;
                    res.send("batch created Successfully");
                }
            });
            
            
        }
    });

});

router.get("/admin/endBatch/:batchid",function(req,res){
    console.log("got ajax call to finish batch"+req.params.batchid);
    Batch.findById(req.params.batchid,function(err, batch){
    if(err){
        console.log(err);
    }
    else{
        let slotarraystr = `avail_slot.${batch.slotno}`;
        Instructor.findByIdAndUpdate(batch.instructorId,{ [slotarraystr] : true },function(err,instr){
            if(err){
                console.log(err);
            }
            else{
                //instr.avail_slot[slot] = false;
                console.log("-------insts----"+instr);
                //instr.save();
                Classroom.findByIdAndUpdate(batch.classId,{ [slotarraystr] : true },function(err,classr){
                    if(err){
                        console.log(err);
                    }
                    else{
                        //classr.avail_slot[slot] = false;
                        console.log("-------class----"+classr);
                        let count=0;
                        batch.associateId.forEach( associateid =>{
                            updateCreditsAndSlot(associateid , batch.courseId , batch.slotno ,updated);
                            function updated(){
                                if(++count == batch.associateId.length){
                                    allDone();
                                }
                            }
                            
                        });
                        async function allDone(){
                            let complete = addBatchtoComplete(req.params.batchid);
                            await complete;                            
                            Batch.findByIdAndDelete(req.params.batchid,function(err,deleted){
                                if(err){ throw err;}
                                console.log("deleted Batch :"+deleted);
                                //checkFirstandReduceRanking(deleted._id);
                                res.send("Batch has ended, Allotted all course credits to associates");
                            });
                        }
                    } 
                });    
            }    
            
        });
    }
    });
});

router.get("/admin/batchdetails/:batchid",function(req,res){
    console.log("ajax call to display batch details");
    let batchid = req.params.batchid;
    console.log(batchid);
    Batch.findById(batchid,function(err,batch){
        if(err){ throw err;}
        else{
            console.log(batch);
        }
        Associate.find( {_id : batch.associateId},function(err, batch_associates){
            if(err){throw err;}
            else{
                console.log("batch_associates:\n"+batch_associates );
                Course.findById(batch.courseId,function(err,bcourse){
                    if(err){ throw err;}
                    else{
                        Instructor.findById(batch.instructorId,function(err,binstructor){
                            Classroom.findById(batch.classId,function(err,bclass){
                                if(err){ throw err;}
                                else{
                                    console.log("batch class -"+bclass);
                                    res.render("show_batch.ejs",{ Batch : batch ,
                                                             associates : batch_associates,
                                                             course : bcourse,
                                                             bclass : bclass,
                                                             instructor : binstructor,
                                                                });
                                }
                            })
                        })
                    }
                })
                
            }
        })
    })
   // res.send("Sent details from server");
})

module.exports = router
