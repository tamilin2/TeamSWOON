$(document).ready(function() {
   
   
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