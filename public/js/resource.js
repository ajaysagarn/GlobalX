let more = document.querySelector(".add-course-sel");

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

$(".instr-reg").submit(function(e) {
  console.log("submiting instructor from with ajax");
  var form = $(this);
  //var url = form.attr('action');

  $.ajax({
    type: "POST",
    url: "/admin/resource/instructor",
    data: form.serialize(), // serializes the form's elements.
    success: function(data) {
      alert(data); // show response from the php script.
    },
    error: function(err){
      console.log(err);
      alert(err);
    }
  });

  e.preventDefault(); // avoid to execute the actual submit of the form.
});

$(".class-reg").submit(function(e) {
  console.log("submiting classroom from with ajax");
  var form = $(this);
  //var url = form.attr('action');

  $.ajax({
    type: "POST",
    url: "/admin/resource/classroom",
    data: form.serialize(), // serializes the form's elements.
    success: function(data) {
      alert(data); // show response from the php script.
    },
    error: function(err){
      console.log(err);
      alert(err);
    }
  
  });

  e.preventDefault(); // avoid to execute the actual submit of the form.
});

// $.ajax({
//              url : '/getCourses',
//              contentType : 'application/json',
//              success : function(response){
//              selection = selection+response+"</select>";
//              $( ".inner" ).append( selection );
//         console.log(selection);
//         },
//         error : function() {
//         alert('Failed');
//         }
//     });
