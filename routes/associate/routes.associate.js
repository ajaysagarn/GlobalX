const express = require('express');
const router = express.Router();
var methodOverride = require("method-override");
var async = require("async");
var arrayMove = require('array-move');
var associate = require("../../models/associate");
var company = require("../../models/company");
var Course = require("../../models/course");
var companyEnrollments = require("../../models/company_enrollments");
var associateEnrollments = require("../../models/associate_enrollments");
var courseCredits = require("../../models/courseCredits");
var associateCredits = require("../../models/associateCredits");
var allotedCredits = require("../../models/allotedCredits");
var coursePlan = require("../../models/cplan");
var Complete = require("../../models/completed");
var Batch = require("../../models/batch");
var Instructor = require("../../models/instructor");
var Classroom = require("../../models/classroom");
var Complete = require("../../models/completed");

router.use(methodOverride("_method"));

//session tracking middleware...not being used.
function isAssociateLoggedIn(req,res,next){
    if(req.isAuthenticated('associate')){
        return next();
    }
    res.redirect("/associateLogin");
}

//function to check if associate has enough credits tot take the course
function hasCredits( associd , courseid , postValidation , hasExperience ){
    courseCredits.find({courseId : courseid},function(err,coursecreds){
        if(err){
            console.log(err);
        }
        else{
            associateCredits.find({associateId : associd},function(err,assocCreds){
                if(err){
                    console.log(err);
                }
                else{
                    let satisfyCount = 0;
                    console.log("no of course Creds :"+ coursecreds.length);
                    console.log("no of associate Creds :"+ assocCreds.length);
                    let count1=0;
                    
                    if(coursecreds.length == 0){ checkedCredits(); }
                    else{
                        coursecreds.forEach( cred=>{
                            let count2=0;
                            assocCreds.forEach( acred=>{
                                if(cred.CreditName == acred.CreditName){
                                    if(acred.CreditCount >= cred.CreditCount){
                                        satisfyCount++;
                                        count2++;
                                    }
                                    else{
                                        console.log("not enough credit count");
                                        postValidation(false);
                                        count2++;
                                    }
                                }
                                else{
                                    count2++;
                                }
                            });
                            console.log("count1 :"+count1);
                            console.log("count2 :"+count2);
                            if( (++count1 == coursecreds.length) && (count2 == assocCreds.length)){
                            checkedCredits();        
                         }
                        });
                    }
                    

                    function checkedCredits(){
                        if(satisfyCount >= coursecreds.length){
                            console.log("all credits present");
                            hasExperience(associd , courseid, postValidation);
                        }   
                        else{
                            console.log("not enough credits");
                            postValidation(false);
                            //return false;   
                        }
                    }
                    
                }
            })
        }
    })
}
//function to check if associate has enough experience to take the course
function hasExperience( associd , courseid , postValidation){

    associate.findById(associd , function(err, assoc){
        if(err){
            console.log(err);
        }
        else{
            Course.findById( courseid , function(err, course){
                console.log("course Experience :" + course.experience);
                console.log("associate Experience :" + assoc.experience);
                if(err){
                    console.log(err);
                }
                else{
                    if(assoc.experience >= course.experience ){
                        console.log("has enough experience");
                        postValidation(true); 
                        //return true;
                    }
                    else{
                        console.log("not enough experience");
                        postValidation(false);      
                    }
                }
            });
        }
    });
}

function convertToYear(exp) {
    let temp = exp
    
        console.log("[convert to year]" + temp);
        if(exp<=0){
            return 0;
        }
        else if (temp >= 1) {
            if (temp % 1 == 0) {
                let newexp = `${temp} year`;
                return newexp;
            }
            else {
                let year = Math.floor(temp);
                temp = temp - year;
                let month = Math.round(temp * 12);
                let newexp = `${year} year(s) ${temp} month(s)`;
                return newexp;
            }
        }
        else {
            temp = Math.round(temp * 12);
            let newexp = `${temp} month(s)`;
            return newexp;
        }
    

}

// function cantakeCourse( cid, duration ,assocExp , sel_courses ){
//     Course.findById(cid,function(err,course){
//         if(err){
//             console.log(err);
//         }
//         else{
//             if( (assocExp + duration) >  course.experience){
//                 courseCredits.find({courseId : cid },function( err , ccredits ){
//                     if( (ccredits.length == 0) || (ccredits == null)){
                        
//                     }
//                     else{
//                         ccredits.forEach( credit=>{
//                             credcount = 0;
//                             sel_courses.forEach(courseid=>{
//                                 if(courseid == cid){
//                                     continue;
//                                 }
//                                 else{
//                                     allotedCredits.findOne({courseId : courseid},function(err,allotedcred){
//                                         if(err){throw err;}
//                                         if(allotedcred.CreditName == credit.CreditName){
//                                             credcount += allotedcred.CreditCount;
//                                         }
//                                     })
//                                 }
//                             })
//                         })
//                     }
//                 })
//             }
//             else{
//                 return false;
//             }
//         }
//     })
    
// }

//to check if any company status has changed to/from premium. then updatre the ranking of all company associates accordingly
function rankingCheck(){
    company.find({},function(err,companies){
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
                            let q = company.where({ _id : comp._id});
                            q.update({ $set: { status : true }}).exec();
                            associate.updateMany({ company : comp._id },{ $inc: { ranking : 3 } },function(err, updatedassoc){
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
                            let q = company.where({ _id : comp._id});
                            q.update({ $set: { status : false }}).exec();
                            associate.updateMany({ company : comp._id },{ $inc: { ranking : -3 } },function(err, updatedassoc){
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


//route to display associate homepage
router.get("/associate/:username", function(req,res){
    associate.findOne({ username : req.params.username}, function(err,assoc){
        if(err){
            console.log(err);
        }
        else{
            console.log(assoc);
            if(assoc == null){
                res.redirect('/**');
            }
            else{
                let assoccourse = [];
            function allDone(){
                Complete.find({associateId : assoc._id},(err,completedCourses)=>{
                    if(err){ throw err;}
                    res.render("associateHome",{ associate : assoc , courses : assoccourse , completed : completedCourses });
                });
                
            }
            associateEnrollments.find({ associateId : assoc._id },function(err,enrolls){
                if(err){
                    console.log(err);
                }
                else if(enrolls.length == 0){
                    allDone();
                }                
                else{
                    console.log(enrolls);
                    enrolls.forEach(enrollment =>{
                    Course.findById( enrollment.courseId , function(err,course){
                            if(err){
                                console.log(err);
                            }
                            else{
                                if(!(course==null)){
                                    assoccourse.push(course);
                                }
                                if(assoccourse.length == enrolls.length){
                                    allDone();
                                }
                            }
                        })
                    })
                }
                
            })
            }
            
        }
    })
});

//route to display courses selected by associates company
router.get("/associate/:username/courses",function(req,res){
    let compCourses = [];
    
   associate.findOne({username : req.params.username },function(err,assoc){
    function allDone(){
        res.render("companyCourses",{associate : assoc , courses : compCourses});
    }
    associateEnrollments.find({associateId : assoc._id}, { courseId: 1 ,_id:0 } ,function(err,assocenrolls){
        let enrolls = [];
        enrolls = assocenrolls.map(function (ele) { return ele.courseId });
        companyEnrollments.find( {compId :assoc.company , courseId: { $nin: enrolls }}, function(err,enrollments){
            if(err){
                console.log(err);
            }    
            
            else if(enrollments.length == 0){
                    console.log("company has no courses");
                    allDone();
                }
            else{
               enrollments.forEach( enrollment => {
                Course.findById(enrollment.courseId ,function(err, course ){
                    if(err){
                        console.log(err);
                    }
                    else{
                    //console.log(course.title);
                    compCourses.push(course);
                    if(compCourses.length == enrollments.length ){
                        console.log("all courses found");
                        allDone();
                    }
                 }
                })
               })
            }
           })
    })
       
   })
});

router.post("/associate/:username/gcourses/:courseid",function(req,res){
    //res.send("check enrollment constraints and enroll if satisfied or give error message");
    associate.find( {username : req.params.username} ,function(err, currassoc){
        if(err){
            console.log()
        }
        else{
            function postValidation(canEnroll){
                console.log("[postvalidation]"+canEnroll)
                if(canEnroll){
                    associateEnrollments.create({
                        associateId : currassoc[0]._id,
                        compId : currassoc[0].company,
                        courseId : req.params.courseid,
                        assoc_avail_slot : currassoc[0].avail_slot
                    },function(err,enrolled){
                        if(err){
                            console.log(err);
                        }
                        else{
                            rankingCheck();
                            req.flash("success","Successfully enrolled!!")
                            res.redirect("/associate/"+req.params.username+"/courses");
                        }
                    })
                }
                else{
                    req.flash("error","You cannot enroll to this course. Insufficient experience or credits");
                    res.redirect("/associate/"+req.params.username+"/courses");
                }
            }
            hasCredits(currassoc[0]._id, req.params.courseid, postValidation ,hasExperience );
        }
    })
});

router.delete("/associate/:associateid/gcourses/:courseid",function(req,res){
    associateEnrollments.deleteMany({associateId : req.params.associateid , courseId : req.params.courseid},function(err, withdrawn){
        if(err){
            console.log(err);
        }
        else{
            console.log("successfully withdrawn enrollment");
            associate.findById(req.params.associateid,function(err,assoc){
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect("/associate/"+assoc.username);
                }
            });
            rankingCheck();
        }
    })
})

router.get("/associate/:assoc_username/planner",function(req,res){
    associate.findOne({ username : req.params.assoc_username },function(err,associate){
        if(err){
            console.log(err);
        }
        else{
            Course.find({},function(err,courses){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("planner.ejs",{associate: associate , courses : courses , cplan : null});
                }
            })
            
        }
    })

});

function CplanObj( C_id , course_title , dependants , to_schedule ,experience) {
    this.C_id = C_id;
    this.course_title = course_title;
    this.dependants = dependants;
    this.to_schedule = to_schedule;
    this.experience = experience;
}

function creditObj ( CreditName , CreditCount){
    this.CreditName = CreditName;
    this.CreditCount = CreditCount;
}


router.post("/associate/:username/planner",function(req,res){
    console.log("insider server planner");
    console.log("req.body:"+req.body.dur_type);
    let duration = req.body.duration;
    let sel_courses = req.body.course;
    let currassoc;
    let courseplan = [];
    let cannot_take = [];
    if(req.body.dur_type=='months'){
        duration = duration/12;
    }
    
    console.log("----selcourses---"+ typeof(sel_courses));
    associate.findOne({username : req.params.username},function(err,assoc){
        if(err){ throw err;}
        currassoc = assoc;
        console.log(currassoc);
        next();
    });
    
     function next(){
        count = 0;
        sel_courses.forEach( courseid=>{
            Course.findById(courseid,function(err,course){
                if(err){ throw err; }
                let toschedule = course.experience - currassoc.experience;
                let exp_req = convertToYear(course.experience);
                if( (currassoc.experience + duration) <= course.experience){
                    console.log("cannot take course"+course.title);
                    cannot_take.push(new CplanObj(course._id,course.title,[], toschedule , exp_req));
                    if(++count == sel_courses.length){
                        next1();
                    }
                }
                else{
                    console.log("can take course "+course.title);
                    courseplan.push(new CplanObj(course._id,course.title,[], toschedule,exp_req));
                    console.log("---------------------------------------"+courseplan[0].experience);
                    if(++count == sel_courses.length){
                        next1();
                    }
                }
            });
        });
    }

    function next1(){
        if(courseplan.length > 0){
            console.log("final cplan array :"+ courseplan[0].course_title);
            courseplan.sort(function(a,b){
                return (a.to_schedule - b.to_schedule);
            });
            console.log("final cplan array :"+ courseplan[0].course_title);
            next2();
        }
        else{
            next2();
        }
       
    }

    let assocCredits;
    function next2(){
        
        associateCredits.find( {associateId : currassoc._id},function(err,acredits){
            if(err){ throw err;}
            else{
                assocCredits = acredits;
                proceed();
            }
        });

        async function proceed(){
            console.log("[--assoccrds---]"+assocCredits);
            for( let i=0; i<courseplan.length ; i++){
                let ccreditsPromise = new Promise((resolve,reject)=>{
                    courseCredits.find({ courseId : courseplan[i].C_id},function(err,ccredits){
                        if(err){ throw err;}
                        else{
                            resolve(ccredits);
                        }
                    });
                });

                let ccredits = await ccreditsPromise;
                if( (ccredits.length == 0) || (ccredits == null) || (ccredits == undefined)){
                    console.log( "No credits req for course "+i+" = "+ccredits);
                }
                else{
                    console.log( "credits req for course "+i+" = "+ccredits);
                    course_creds = []; 
                    
                    let makecreditsArray = new Promise((resolve,reject)=>{
                        ccredits.forEach( credit=>{
                            course_creds.push(new creditObj(credit.CreditName,credit.CreditCount));
                        });
                        resolve();
                    });
                    await makecreditsArray; 
                    
                    let splice_index = [];

                    if(assocCredits && assocCredits.length > 0 ){
                        for(let i=0 ; i< course_creds.length; i++){
                            for(let j=0 ; j < assocCredits.length; j++){
                                if(course_creds[i].CreditName== assocCredits[j].CreditName){
                                    course_creds[i].CreditCount -= assocCredits[j].CreditCount;
                                    if(course_creds[i].CreditCount <= 0){
                                        splice_index.push(i);
                                        break;
                                    }
                                }
                            }
                        }
                        if(splice_index.length>0){
                            splice_index.forEach(index=>{
                                course_creds.splice(index,1);
                            });
                        }
                        if(course_creds.length == 0){
                            console.log("associate has creddits");
                            continue;//move onto the next course in courseplanarray as associate satisfies course credits
                        }
                    }
                    //this code runs only if associate does not have credits required for the course
                    console.log("Associate does not have required credits");
                    console.log("index:"+i)
                    for(let k=0 ; k < courseplan.length ; k++){
                        console.log("[K="+k+" | i="+i+" ]")
                        if(k==i && i+1 == courseplan.length){
                            console.log("last course cannot take this course!")
                            cannot_take.push(courseplan[i]);
                            courseplan.splice(i,1);
                            i--;
                            break;
                        }
                        if(k==i){
                            continue;
                        }

                        let getCourseCredits = new Promise((resolve,reject)=>{
                            console.log("inside promise"+k);
                            allotedCredits.find({courseId: courseplan[k].C_id},function(err,comp_Ccreds){
                                if(err){ throw err;}
                                else{
                                    resolve(comp_Ccreds);
                                    console.log()
                                }
                            });
                        });

                        allot_ccreds = await getCourseCredits;
                        console.log("allotting credits:"+allot_ccreds);
                        console.log("required credits"+course_creds[0].CreditName);
                        let splice_index1 = [];
                        for(let u=0 ; u< course_creds.length; u++){
                            for(let v=0 ; v < allot_ccreds.length; v++){
                                if(course_creds[u].CreditName==  allot_ccreds[v].CreditName){
                                    course_creds[u].CreditCount -=  allot_ccreds[v].CreditCount;
                                    if(course_creds[u].CreditCount <= 0){
                                        splice_index1.push(u);
                                        break;
                                    }
                                }
                            }
                        }
                        if(splice_index1.length>0){
                            console.log("some credit satisfied");
                            console.log(splice_index1);
                            splice_index1.forEach(index=>{
                                course_creds.splice(index,1);
                            });
                        }
                        if((course_creds.length) == 0 || (course_creds == null)){
                            if(k <= i){
                                break;
                            }
                            else if( k > i){
                                //move the course in location courseplan[i] to location courseplan[k+1]
                                console.log("moving course to new location");
                                console.log("beforemoving:[0]"+courseplan[0].course_title)
                                console.log("[1]"+courseplan[1].course_title);
                                deleted = courseplan.splice(i,1);
                                console.log(deleted[0]);
                                courseplan.splice(k,0,deleted[0]);
                                //arrayMove(courseplan,i,k);

                                console.log("Aftermoving:[0]"+courseplan[0].course_title)
                                console.log("[1]"+courseplan[1].course_title);
                                i--;
                                break;
                            }
                        }
                        else{
                            console.log("courseplan.length :"+courseplan.length);
                            console.log("k+1 :"+ k+1);
                            if(k+1 == courseplan.length){
                                console.log("Credits cannot be acquired from selected courses. cannot take course"+courseplan[i]);
                                cannot_take.push(courseplan[i]);
                                courseplan.splice(i,1);
                                i--;
                                break;
                            }
                        }   
                    }    
                       
                }
                
            }
            console.log("looped through all possible courses")
            for(let i=0; i < courseplan.length ; i++){
                courseplan[i].to_schedule = convertToYear(courseplan[i].to_schedule);
            }
            for(let j=0; j < cannot_take.length ; j++){
                cannot_take[j].to_schedule = convertToYear(cannot_take[j].to_schedule);
            }
            Course.find({},function(err,courses){
                if(err){ throw err;}
                else{
                    //console.log("plans"+courseplan[0].experience);
                    res.render("snippets/plantable.ejs",{cplan : courseplan , cannottake : cannot_take , associate : currassoc });
                }
            })
           // res.render("planner.ejs",{cplan : courseplan});
        }
    }
   
});


router.get("/associate/:username/details/:courseid",(req,res)=>{
    associate.findOne({username : req.params.username},(err,associate)=>{
        if(err){ throw err;}
        Course.findById(req.params.courseid,(err,course)=>{
            if(err){ throw err}
            courseCredits.find({courseId : req.params.courseid},(err,reqCredits)=>{
                if(err){ throw err;}
                allotedCredits.find({courseId:req.params.courseid},(err,allotcreds)=>{
                    if(err){ throw err;}
                    console.log("allotted creds:"+allotcreds);
                    res.render("CourseInfo",{associate : associate , course : course , reqCredits : reqCredits , allotcreds : allotcreds});
                })
            })
        })
    })
    
})

router.get("/associate/:username/profile",function(req,res){
    console.log("here");
    associate.findOne({username : req.params.username},function(err,assoc){
        if(err){ throw err;}
        associateCredits.find({associateId : assoc._id},function(err, credits){
            if(err){ throw err;}
            Complete.find({ associateId : assoc._id},(err,completed)=>{
                if(err){ throw err;}
                else{
                    res.render("userProfile",{ associate : assoc , credits : credits , complete : completed });
                }
            })
            
        })
        
    })
    //res.render("userProfile");
});

router.get("/associate/:assocId/:batchid",function(req,res){
    console.log("ajax call to display batch details");
    let batchid = req.params.batchid;
    console.log(batchid);
    Batch.findById(batchid,function(err,batch){
        if(err){ throw err;}
        else{
            console.log(batch);
        }
        associate.find( {_id : batch.associateId},function(err, batch_associates){
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
                                    associate.findById(req.params.assocId,(err,currAssoc)=>{
                                        res.render("assoc_show_batch.ejs",{ Batch : batch ,
                                            associates : batch_associates,
                                            course : bcourse,
                                            bclass : bclass,
                                            instructor : binstructor,
                                            associate : currAssoc
                                               });    
                                    })
                                    
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

module.exports = router;