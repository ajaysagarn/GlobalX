
var finishbat = document.querySelectorAll(".finish-batch");
var finbat_forms = document.querySelectorAll(".end-batform");
//alert(finishbat.length);
//alert(finbat_forms.length);
for(let i = 0 ; i< finishbat.length; i++){
    finishbat[i].addEventListener('click',function(){
        let url = finbat_forms[i].getAttribute("action");
        //alert(url);
        if(confirm("Are you sure you want to end this Batch?")){
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
        
    })
}


