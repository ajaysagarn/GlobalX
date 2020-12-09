let inst_availSlots = [false,false,false,false,false,false,false,false];
let class_availSlots = [false,false,false,false,false,false,false,false];
let enroll_availcount = [0,0,0,0,0,0,0,0];
let enrolls = $("#no-enrolls").data("enrolls");
//let batches = [$(".batches").data("batches")];
let batchIds = $(".batches").data("batches");
let batchSize = enrolls;
let selectSlot ;
let sel_instr;
let sel_class;
let courseid;
let cbatches =  batchIds.split(",");
// alert(batches);
// alert(enrolls);

$(document).ready(function() {
    //alert(typeof(window.location.href));
    courseid  = getCourseId(window.location.href);
    setBatchOptions();
    selectSlotAndSchedule();
    loadBatches();
    console.log(courseid);
    $.ajax({
        type: "GET",
        url: "/getEnrollCount/"+courseid,
        data: "data",
        dataType: "json",
        success: function (response) {
            //console.log(response);
            addAvailableCount(response);
            enroll_availcount=response;
            setButtons();
            
        },
        error : function(err){
            console.log("[ERROR]:"+err);
        }
    });
})

//alert("connected scheduler.js")
$(".instructor").change(function(){
    let instructor = $(".instructor").val();
    let availslots = [];
    //alert("selected :"+ instructor);
    $.ajax({
        type: "GET",
        url: "/getInstructor/"+instructor,
        data: "data",
        dataType: "json",
        success: function (response) {
            availslots = response.avail_slot;
            //console.log("instructor :"+availslots);
            displaySlots(availslots,1);
            inst_availSlots = availslots;
            sel_instr = response._id;
            setButtons();
        },
        error : function(error){
            alert(error);
        }
        
    });
});

$(".classroom").change(function(){
    //alert("classroom changed");
    let classroom = $(".classroom").val();
    let availslots = [];
    //alert("selected :"+ classroom);
    $.ajax({
        type: "GET",
        url: "/getClassroom/"+classroom,
        data: "data",
        dataType: "json",
        success: function (response) {
            availslots = response.avail_slot;
           // console.log("classroom"+availslots);
            displaySlots(availslots,2);
            class_availSlots = availslots;
            sel_class = response._id;
            setButtons();
        },
        error : function(error){
            alert(error);
        }
        
    });
});

function displaySlots(slots, type) {
    let count = 1;
    if (type == 1) {
        slots.forEach(slot => {
            let slotid = "inst-slot" + count++;
            console.log(slotid);
            let tableslot = document.getElementById(slotid);
            if (slot) {
                tableslot.classList.remove("slot-block");
                tableslot.classList.add("slot-avail");
            }
            else {
                tableslot.classList.remove("slot-avail");
                tableslot.classList.add("slot-block");
            }
        });
    }
    else if(type == 2){
        slots.forEach(slot => {
            let slotid = "class-slot" + count++;
            console.log(slotid);
            let tableslot = document.getElementById(slotid);
            if (slot) {
                tableslot.classList.remove("slot-block");
                tableslot.classList.add("slot-avail");
            }
            else {
                tableslot.classList.remove("slot-avail");
                tableslot.classList.add("slot-block");
            }
        });

    }
}

function getCourseId(url){
    var i = url.length-1;
    courseid = "";
    if(url.charAt(i)=='?'){
        i--;
    }
    while( url.charAt(i) !='/'){
        courseid += url.charAt(i--);
    }
    courseid = reverseString(courseid);
    //console.log("courseid:"+courseid);   
    return courseid;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function addAvailableCount(availability){
    var datas = document.querySelectorAll(".inst-avail-tbl tbody td");
    //console.log(datas);
    let i;
    let j=0;
    for(i=0; i<=8 ; i++){
        if(i!=4){
        datas[i].innerText = availability[j++];
        }
    }
    
    datas = document.querySelectorAll(".class-avail-tbl tbody td");
    //console.log(datas);
    j=0;
    for(i=0; i<=8 ; i++){
        if(i!=4){
        datas[i].innerText = availability[j++];
        }
    }
}

function setButtons(){
    console.log(inst_availSlots);
    console.log(class_availSlots);
    console.log(enroll_availcount);
    var buttons = document.querySelectorAll("td button");
    //console.log(buttons);
    let j=0;
    for(let i=0; i<=8;i++){
        if(i!=4){
            if( !(inst_availSlots[j] && class_availSlots[j] && enroll_availcount[j]>=5)){
                console.log("disabling :"+j);
                buttons[j++].setAttribute("disabled","");
            }
            else{
                console.log("enabling:"+j);
                buttons[j++].removeAttribute("disabled");
            }
        }
    }
}

function selectSlotAndSchedule(){
var selectbutton = document.querySelectorAll("td button");
var schedulebtn = document.getElementById("btn-sch");
    for( let i = 0 ; i< selectbutton.length ; i++){
        selectbutton[i].addEventListener('click',function(){
            //alert("selected :"+i);
            schedulebtn.removeAttribute("disabled");
            selectSlot = i;
        });
    }  
}

$("#btn-sch").click(function(){
    //alert("clicked schedule");
    var mypostdata = {
        batchSize : batchSize,
        slot : selectSlot,
        instructor :  sel_instr,
        class : sel_class,
        courseId : courseid,
        batchsize : batchSize
    }
    console.log(mypostdata);
    $.ajax({
        type: 'POST',
        url: '/admin/scheduleBatch',
        //contentType: "application/json; charset=utf-8",
        data: mypostdata,
        success: function (response) {
            alert(response);
            window.location.reload(true);
        }
    });
});

$(".bat-size").change(function(){
    batchSize = $(".bat-size").val();
    console.log(batchSize);
});

function setBatchOptions(){
    var batchoptions = document.querySelector(".bat-size");
    let option;
    if(enrolls > 20 && enrolls < 30 ){
        batchSize = 20;
        option = '<option selected = "selected" disabled>'+batchSize+'</option>';
        batchoptions.innerHTML = option;
    }
    else if( enrolls >= 30 && enrolls <40 ){
        batchSize = Math.floor( enrolls/2 );
        console.log("batchSize: "+batchSize);
        if(enrolls <36){
            option = `<option selected="selected"> ${batchSize} </option>`;
        option += `<option> ${batchSize-3} </option>`;
        option += `<option> ${batchSize-2} </option>`;
        option += `<option>${batchSize-1} </option>`;
        option += `<option> ${batchSize+1} </option>`;
        option += `<option> ${batchSize+2} </option>`;
        option += `<option> ${batchSize+3} </option>`;
        
        batchoptions.innerHTML = option;
        }
        else if(enrolls < 38){
            option = `<option selected="selected"> ${batchSize} </option>`;
        option += `<option> ${batchSize-3} </option>`;
        option += `<option> ${batchSize-2} </option>`;
        option += `<option>${batchSize-1} </option>`;
        option += `<option> ${batchSize+1} </option>`;
        option += `<option> ${batchSize+2} </option>`;
        batchoptions.innerHTML = option;
        }
        else{
            option = `<option selected="selected"> ${batchSize} </option>`;
        option += `<option> ${batchSize-3} </option>`;
        option += `<option> ${batchSize-2} </option>`;
        option += `<option>${batchSize-1} </option>`;
        option += `<option> ${batchSize+1} </option>`;
        batchoptions.innerHTML = option;
        }
        
    }
    else if(enrolls >= 40 ){
        batchSize = 20
        option = '<option selected = "selected" disabled>'+batchSize+'</option>';
        batchoptions.innerHTML = option;
    }

}

function loadBatches(){
    let batchtable = document.querySelector("#bat-details");
    if(cbatches.length == 0 || cbatches[0]==""){
        batchtable.innerHTML = "No Current bathes scheduled for this course!";
    }
    else{
        count = 1 ;
        console.log(typeof(batchIds));
        console.log(cbatches);
        cbatches.forEach(batch => {
            console.log(batch);
            //thisbatch = JSON.parse(batch);
            
            let html = `<div class="card" style="width: 100%;">`;
            html += `<div class="card-body">`;
            html += `<h5 class="card-title">BATCH -${count}</h5><div class="row">`;
            html += `<form action="/admin/batchdetails/${batch}" class="get-det"><button class="btn-det-bat btn btn-primary btn-sm"> DETAILS</button></form>`;
            html += `<button class="btn-fin-bat btn btn-primary btn-sm"> Finish </button>`;
            html += `</div></div></div>`;
            //let html = `<div class="row"> <td> BATCH -${count}<br> <button class="btn-det-bat btn btn-primary btn-sm"> DETAILS</button> <button class="btn-fin-bat btn btn-primary btn-sm"> Finish </button> </td></div>`;
            console.log(html);
            $("#bat-details").append(html);
            if(count++ == cbatches.length){
                allLoaded();
            }
        });
        
        function allLoaded(){
            var details_btn = document.querySelectorAll(".btn-det-bat");
            var finish_btn = document.querySelectorAll(".btn-fin-bat");
            // console.log("detailsbtns :"+ details_btn.length);
            // console.log("finisfsbtns :"+ finish_btn.length);
            // for( let i = 0 ; i< details_btn.length ; i++){
            //     details_btn[i].addEventListener('click',function(){
            //         alert("selected details batch:"+i);
            //         //overlay();
            //         $('.btn-det-bat').popup({
            //             background: true,
            //             center: false,
            //         });
            //         //document.getElementById("overlay").style.display = "block";
            //         showdetails(cbatches[i]);
            //         //showBatchDetails(cbatches[i]);
            //     });
            // }
            for( let i = 0 ; i< finish_btn.length ; i++){
                finish_btn[i].addEventListener('click',function(){
                    //alert("selected finish batch:"+i);
                    if(confirm("Are you sure you want to end this Batch?")){
                        finishBatch(cbatches[i]);
                    }  
                });
            } 
        }
        
    }
}

function finishBatch(batchid){
    //alert("finishing batch with id"+batchid);
    let url = "/admin/endBatch/"+batchid;
    $.ajax({
        type: "GET",
        url: url,
        data: "data",
        //dataType: "json",
        success: function (response) {
            alert(response);
            window.location.reload(true);
        },
        error: function(err){
            alert(err);
        }
    });
}


// $(function () {
//     $('.btn-det-bat').popup({
//         background: true,
//         center: false,
//     });
// });



function showdetails(batchid){
    //var close_det = document.querySelector("#close-overlay");
    let url = "/admin/batchdetails/"+batchid;
    $.ajax({
        type: "GET",
        url: url,
        data: "data",
        //dataType: "json",
        success: function (response) {
            console.log(response);
            document.querySelector("#pop-up-content").innerHTML = response;
        },
        error: function(err){
            alert(err);
        }
    });
    // close_det.addEventListener('click',function(){
    //     document.getElementById("overlay").style.display = "none";
    // })
}


/*--------------------------------------*/

// ;(function($){

//     var defaults = {
//         background: true,
//         center: true,
//         escClose: true,
//         appearance: 'top',
//     };

//     function Popup(element, options) {
//         var widget = this;
//         widget.config = $.extend({}, defaults, options);
//         widget.element = element;

//         widget.init();
//     }

//     Popup.prototype.init = function() {
        
//         var show = this.show.bind(this);
//         var hide = this.hide.bind(this);
//         var esc = this.config.escClose;
//         var obj = {
//             "key": esc
//         };
        
//         this.element.on('click', function() {    
//             show();
//             return false;
//         });

//         $(".js__p_body").on("click", function() {
//             hide();
//         });

//         $('.js__p_close').on("click", function() {
//             hide();
//             return false;
//         });

//         this.element.keyup(obj, function(e) {
//             if (e.keyCode === 27 && obj.key) {
//                 hide();
//             } 
//         });
//     }

//     Popup.prototype.show = function() {
//         var appearance = this.config.appearance;
//         var background = this.config.background;
//         var center = this.config.center;

//         $('body').css('overflow-y', 'hidden');

//         if (!center) {
//             $(".js__popup").css(appearance, '50%');

//             if (appearance === 'right') {
//                 $(".js__popup").css({appearance: '50%', 'left': 'auto'});
//             } else if (appearance === 'bottom') {
//                 $(".js__popup").css({appearance: '50%', 'top': 'auto'});
//             }

//             $(".js__popup").addClass(appearance);
//         } 

//         if (background) {
//             $(".js__p_body").removeClass("js__fadeout");
//         }

//         $(".js__popup").removeClass("js__slide_top");
//     }

//     Popup.prototype.hide = function() {
//         var appearance = this.config.appearance;

//         $('body').css('overflow-y', 'auto');

//         $(".js__popup").css(appearance, '');
//         $(".js__popup").removeClass(appearance);
 
//         $(".js__p_body").addClass("js__fadeout");
//         $(".js__popup").addClass("js__slide_top");
//     }

//     $.fn.popup = function (options){
//         new Popup(this.first(), options);
//         return this.first();
//     }; 
// })(jQuery)