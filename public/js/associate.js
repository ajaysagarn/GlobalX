//alert("connected to associate home js");
let associate = $("#assoc").data("associate");



$(document).ready(function() {
    //alert(typeof(window.location.href));
    let count = 1;
    associate.avail_slot.forEach(Slot => {
    let slotid = "assoc-slot" + count++;
    let tableslot = document.getElementById(slotid);
    if (Slot) {
        tableslot.classList.remove("slot-block");
        tableslot.classList.add("slot-avail");
    }
    else {
        tableslot.classList.remove("slot-avail");
        tableslot.classList.add("slot-block");
    }
    
    });
    $.ajax({
        type: "GET",
        url: "/getBatches/"+associate._id,
        data: "data",
        dataType: "json",
        success: function (response) {
            console.log("associateBatches :"+response);
            setButtons(response);
            
        },
        error : function(err){
            console.log("[ERROR]:"+err);
        }
    });
});

function setButtons(batches){
    if(batches && batches.length > 0){
        for(let i=0 ; i < batches.length; i++){
            let slotid = "slot-det" + batches[i].slotno;
            let tableslot = document.getElementById(slotid);
            let html = `<form action = "/associate/${associate._id}/${batches[i]._id}" method="GET">`;
            html += `<button type = "submit" class="btn btn-outline-danger btn-sm">Details</button></form>`;
            tableslot.innerHTML = html;
        }
        
    }
}