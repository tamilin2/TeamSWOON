$(document).ready(function() {
   $("#start-time-input").change(function() {
       document.getElementById("end-time-input").min = document.getElementById("start-time-input").value;
   });
    $("#end-time-input").change(function() {
       document.getElementById("start-time-input").max = document.getElementById("end-time-input").value;
   });
   
    $("#clr-btn").click(function(){
        $(".list-group-item").css("background-color", "");
        $(".SubCategories").attr("checked", false);
    });

    $(".list-group-item").click(function() {
        if (!$(this).children(".SubCategories").prop("checked")) {
            $(this).children(".SubCategories").attr("checked", true);
            $(this).children(".interestlabel").css("font-weight", "bold");
        }
        else {
            $(this).children(".SubCategories").attr("checked", false);
            $(this).children(".interestlabel").css("font-weight", "normal");
            $(this).css("background-color", "");
        }
    });
    
});