$(document).ready(function() {
   
    function toggleStyle(){
        if ($(this).prop('checked')){
            $(this).parent().css("background-color", "whitesmoke");
            $(this).parent().css("border-left", "1px solid dodgerblue!important");
       }
       
       if (!$(this).prop('checked')){
            $(this).parent().css("background-color", "");
            $(this).parent().css("border-left", "");
       }
    }
   $(".SubCategories").change(toggleStyle);
    
    $("#clr-btn").click(function(){
        $(".list-group-item").css("background-color", "");
    });
    
    $(".list-group-item").click(function() {
        if (!$(this).children(".SubCategories").prop("checked")) {
            $(this).children(".SubCategories").attr("checked", true);
            $(this).css("background-color", "whitesmoke");
        }
        else {
            $(this).children(".SubCategories").attr("checked", false);
            $(this).css("background-color", "");
        }
    });
});