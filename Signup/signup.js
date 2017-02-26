$(document).ready(function() {
    var form;
   $("#createbtn").click(function() {
       form = $(".field").serializeArray();
       console.log(form);
       alert("Your account has been created");
   });
});