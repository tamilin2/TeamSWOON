$(document).ready(function() {
   
   $(".SubCategories").change(function(){
        
        if ($(this).prop('checked')){
            console.log("Yee");
            $(this).parent().css("background-color", "whitesmoke");
            $(this).parent().css("border-left", "1px solid dodgerblue!important");
       }
       
       if (!$(this).prop('checked')){
            console.log("Yee");
            $(this).parent().css("background-color", "");
            $(this).parent().css("border-left", "");
       }
   });
    
    $("#clr-btn").click(function(){
        $(".list-group-item").css("background-color", "");
    });
});