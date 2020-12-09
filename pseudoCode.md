----------------------------------------Global X Trainings----------------------------------------------------
schemas
--------------------------------------------------------------------------------------------------------------

course{
    title : string,
    experience : Number,
    credits_req   : { credName: String 
                     credCount : Number
              }
    credits_allot : {
        credName : String
        credCount : Number
    }
    duration : Number 
}

Company{
    Name : String,
    name : String,
    status    : { type : Boolean  , default : false },
}

associate { 
    Name : String,
    Company : [{type : mongoose.Schema.Types.ObjectId, ref: "Company" }]
    experience : Number,
    credits : [{ credName: String 
                 credCount : Number
              }],
    enroll_no  :{ type: Number, default : 0 },
    avail_slot : [1,1,1,1,1,1,1,1,1]    
    ranking : {type : Number, default : 3 }
}

instructor{
    name : String
    courses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Course"
        }
    ]
    avail_slot : [1,1,1,1,1,1,1,1,1]
}

classroom{
    num : Number
    avail_slot : [1,1,1,1,1,1,1,1,1];
}

curriculum {
    comp : String
    course : string
}

enrollment {
    associate : String
    company : String
    course : String
}

----------------------------------------------------------------------------------------------------------------------------------

FOR ADMIN : 
    admin logs into the portal
    admin has course options , scheduler option ,
    in course option admin can create, delete, and modify courses

    in Scheduler option : admin is given list of courses that have enough enrollments to be alloted a classroom
                          view scheduled classes information
                          add a new instructor
                          add a new classroom

    when admin clicks on the course if enrollments is less than 21 
                                                then one batch will be displayed
                                    else if enrollments >= 30
                                                two batches will be shown with first batch having students that have a higher ranking
    admin clicks on the batch and is given option allot instructor and allot classroom
                                in allot instructor all available instructor for that course are displayed
                                    admin selects the instructor
                                in allot classroom all classrooms are displayed with available slots number.
                                    admin selects a classroom and its daily available slots are displayed.
                                    admin selects one or more slots.
                                if both instructor and classroom slot is selected then class will be scheduled for those slots daily
                                untill the no of hours requirement for the course is satisfied.
        


For Company : 
    Existing companies can log in 
    new companies can Sign up 
    After log in companies can they are displayed all courses they add to their curriculum
    they can add new courses to their curriculum by selecting courses from global x courses list
    they can remove any course from their curriculum
    check how many of their employees have enrolled to each course
    check total number of enrollments of their employees.



For Associates : 
    Existing associates can log in
    new Associates can sign up in the portal
    after login associate are displayed all courses they have enrolled for
    associates can unregister from any enrollments before the start of the couse
    associate can enroll to new courses available in their company's curriculum
    associate has access to a planner where he can again select courses from company's curriculum
    associate enters time period within which he wants to complete these courses
    based on these entries harsha gets a plan of the order in which he has to take courses
    he gets a list of courses he cannot take within the time period




