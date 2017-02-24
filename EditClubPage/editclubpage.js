$(document).ready(function() {
    
    $("#interests").keydown(function(key) {
        var toAdd = $("input[id=interests]").val();
        switch(parseInt(key.which,10)){
            case 13:
                $("#interestheader").append("<p>" + toAdd + "</p>");
                break;
        }
    });
});