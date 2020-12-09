$(document).on("click", ".add-course-sel", function() {
    var selection = '<div><select class="form-control" name="course[]">';
    $.ajax({
      url: "/getCourses",
      contentType: "application/json",
      success: function(response) {
        selection = selection + response + "</select></div>";
      },
      error: function() {
        alert("Failed");
      }
    }).done(function() {
      //alert("ajax call done");
      console.log(selection);
      $(".instr-courses").append(selection);
    });
});
//alert("connected");
var associate = $("#username-holder").data("associd");
console.log("username:"+associate);
var loading = document.getElementById("loading");
$(".course-plan").submit(function(e) {
    console.log("submiting planner form with ajax");
    var form = $(this);
    console.log(form.serialize());
    var url = "/associate/"+associate+"/planner";
    console.log(url);
    $.ajax({
      type: "POST",
      url: url,
      data: form.serialize(), // serializes the form's elements.
      beforeSend: function(){
        loading.style.visibility = 'visible';

      },
      success: function(data) {
        //alert(data); // show response from the php script.
        var plandiv = document.getElementById("plan-here");
        console.log(data);
        plandiv.innerHTML = data;
        //window.location.reload(true);
      },
      error: function(){
          console.log("error");
      },
      complete: function(){
        loading.style.visibility = 'hidden';
      }
      
    });
    e.preventDefault(); // avoid to execute the actual submit of the form.
  });