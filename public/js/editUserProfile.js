$(document).ready(function() {
    $("#start-time").change(function() {
       document.getElementById("end-time").min = document.getElementById("start-time").value;
   });
    
    var count = 1;
    var maxRows = 20;
    
    function addFields() {
        if (count > maxRows){
            alert("Maximum number of schedule inputs reached");
        }
        else {
            var newRow = $("#primary-row").clone();
            newRow.attr("id", function(){
                return "primary-row"+count;});
            newRow.insertBefore("#submit-row");
            count++;
            if($("#remove-form-field").hasClass("disabled")){
                $("#remove-form-field").removeClass("disabled");
            }
        }
    }
    function removeFields() {
        if(count==1) {
            alert("No fields to remove");
        }
        else {
            var toRemove = "#primary-row" + (count-1);
            $(toRemove).remove();
            count--;
            if(count == 1){
                $("#remove-form-field").addClass("disabled");
            }
        }
        
    }
    
    $(".add_form_field").click(addFields);
    $("#remove-form-field").click(removeFields);
    
});