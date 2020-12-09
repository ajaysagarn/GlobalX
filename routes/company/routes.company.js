const express = require("express");
const router = express.Router();
//var jQuery = require("jquery");

var company = require("../../models/company");
var Course = require("../../models/course");
var companyEnrollments = require("../../models/company_enrollments");
var associateEnrollments = require("../../models/associate_enrollments");
var Associate = require("../../models/associate");
var Completed = require("../../models/completed");
var Batch = require("../../models/batch");
var courseCredits = require("../../models/courseCredits");
var allotCredits = require("../../models/allotedCredits");
var Instructor = require("../../models/instructor");
var Classroom = require("../../models/classroom");

//session tracking middleware...not being used.
function isCompanyLoggedIn(req, res, next) {
  if (req.isAuthenticated("company")) {
    return next();
  }
  res.redirect("/companyLogin");
}

function findCoursesAndSend(req, res, compEnroll, comp) {
  let compCourses =
    [] &
    compEnroll.array.forEach(enrollment => {
      Course.findById(enrollment.courseid, function(err, course) {
        if (err) {
          console.log(err);
        } else {
          compCourses.push(course);
        }
      });
    });

  res.render("companyHome", { company: comp, curriculum: compCourses });
}


function getCompanyBatches(companyid){
  return new Promise((resolve,reject)=>{
    let associds;
    Associate.find({company : companyid},{_id:1},(err,associates)=>{
      associds = associates.map(function (ele) { return ele._id });
      
        
      console.log(associds);
        resolve(associds);
      
    })
  })
}

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
                          let q = company.where({ _id : comp._id});
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

router.get("/company/:id", function(req, res) {
  company.findOne({ username: req.params.id }, function(err, comp) {
    if (err) {
      console.log("company not found in db");
    } else {
      //console.log(comp);
      let courses = [];
      function allDone() {
        res.render("companyHome", { company: comp, curriculum: courses });
      }
      companyEnrollments.find({ compId: comp._id }, function(err, enrollments) {
        if (err) {
          console.log(err);
        } else {
          console.log("typeof curriculum:" + enrollments);
          if (enrollments.length == 0) {
            allDone();
          }
          enrollments.forEach(enrollment => {
            Course.findById(enrollment.courseId, function(err, course) {
              if (err) {
                console.log(err);
              } else {
                courses.push(course);
                if (courses.length == enrollments.length) {
                  allDone();
                }
              }
            });
          });
        }
      });
    }
  });
});

//create curriculum
router.get("/company/:username/gcourses", function(req, res) {
  company.findOne({ username: req.params.username }, function(err, comp) {
    if (err) {
      console.log(err);
    } else {
      companyEnrollments.find(
        { compId: comp._id },
        { courseId: 1, _id: 0 },
        function(err, compenrolls) {
          if (err) {
            throw err;
          } else {
            let enrollcourses = [];
            enrollcourses = compenrolls.map(function(ele) {
              return ele.courseId;
            });
            console.log("company enrolls :" + enrollcourses);
            Course.find({ _id: { $nin: enrollcourses } }, function(
              err,
              gcourses
            ) {
              if (err) {
                console.log(err);
              } else {
                res.render("select_courses", {
                  company: comp,
                  courses: gcourses
                });
              }
            });
          }
        }
      );
    }
  });
});

//add course to curriculum

router.post("/company/:username/gcourses/:courseid", function(req, res) {
  company.findOne({ username: req.params.username }, function(err, comp) {
    if (err) {
      console.log(err);
    } else {
      companyEnrollments.create(
        { compId: comp._id, courseId: req.params.courseid },
        function(err, compenroll) {
          if (err) {
            console.log(err);
          } else {
            console.log("course added to company");
            res.redirect("/company/" + comp.username + "/gcourses");
          }
        }
      );
    }
  });
});

router.get("/company/:username/:courseId/enrolls", function(req, res) {
  console.log("here");
  company.findOne({ username: req.params.username }, function(err, company) {
    if (err) {
      throw err;
    } else {
      console.log(company);
      console.log(company._id);
      console.log(req.params.courseId);
      associateEnrollments.find(
        { compId: company._id, courseId: req.params.courseId },
        { associateId: 1, _id: 0 },
        function(err, enrollments) {
          if (err) {
            throw err;
          } else {
            let associateids = [];
            associateids = enrollments.map(function(ele) {
              return ele.associateId;
            });
            console.log(associateids);
            Associate.find({ _id: associateids }, function(err, associates) {
              if (err) {
                throw err;
              } else {
                Course.findById(req.params.courseId, function(err, course) {
                  if (err) {
                    throw err;
                  } else {
                    Completed.find({CourseId:req.params.courseId , CompanyId : company._id},async (err,complete)=>{
                      if(err){ throw err; }
                      else {
                          associds = await getCompanyBatches(company._id);
                          Batch.find({ associateId: { $in: associds }, courseId: req.params.courseId }, (err, Batches) => {
                          if (err) { throw err; }
                          console.log("Batch" + Batches);
                          res.render("companyEnrolls", {
                            enrolls: associates,
                            course: course,
                            company: company,
                            completed: complete,
                            Batches: Batches
                          });
                        }) 
                                                    
                      }
                    })
                  }
                });
              }
            });
          }
        }
      );
    }
  });
  //res.render("companyEnrolls");
});


router.get("/company/:username/:courseid/remove", (req, res) => {
  company.findOne({ username : req.params.username }, (err, company) => {
    if (err) { throw err; }
    associateEnrollments.deleteMany({ courseId: req.params.courseid, compId: company._id }, (err, deletedAssocEnrolls) => {
      if(err){ throw err;}
      companyEnrollments.deleteMany({ courseId: req.params.courseid, compId: company._id}, (err,deletedCompEnrolls)=>{
        if(err){ throw err;}
        req.flash("success","Removed course successfully!")
        res.redirect(`/company/${company.username}`);
      })  
    });
  });
});


router.get("/company/:username/gcourses/:courseid/details",(req,res)=>{
  company.findOne({username : req.params.username},(err,company)=>{
    if(err){ throw err;}
    Course.findById(req.params.courseid,(err,course)=>{
        if(err){ throw err}
        courseCredits.find({courseId : req.params.courseid},(err,reqCredits)=>{
            if(err){ throw err;}
            allotCredits.find({courseId:req.params.courseid},(err,allotcreds)=>{
                if(err){ throw err;}
                console.log("allotted creds:"+allotcreds);
                res.render("compCourseInfo",{company : company , course : course , reqCredits : reqCredits , allotcreds : allotcreds});
            })
        });
    });
});
});

router.get("/company/:username/batchdetails/:batchid",function(req,res){
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
                                  company.findOne({username : req.params.username},(err,comp)=>{
                                    if(err){ throw err;}
                                    res.render("show_batch_comp.ejs",{ Batch : batch ,
                                      associates : batch_associates,
                                      course : bcourse,
                                      bclass : bclass,
                                      instructor : binstructor,
                                      company : comp
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
