$(document).ready(function() {
   
   
    $("#clr-btn").click(function(){
        $(".SubCategories").attr("checked", false);
        $(".interestlabel").css("font-weight", "normal");
    });

    $(".list-group-item").click(function() {
        if (!$(this).children(".SubCategories").prop("checked")) {
            $(this).children(".SubCategories").attr("checked", true);
            $(this).children(".interestlabel").css("font-weight", "bold");
        }
        else {
            $(this).children(".SubCategories").attr("checked", false);
            $(this).children(".interestlabel").css("font-weight", "normal");
        }
    });
    
});