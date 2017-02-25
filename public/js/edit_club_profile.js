$(document).ready(function() {
    function clubProfile(name, email, phone, site, descrip, meetings) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.site = site;
        this.description = descrip;
        this.meetings = meetings;
    }

    function meeting(startday, starttime, startseg, endday, endtime, endseg) {
        this.startday = startday;
        this.starttime = starttime;
        this.endday = endday;
        this.endtime = endtime;
    }

    $('#clubname').change(function () {
        var name = $("input[name=clubname]").val();
    });

    var dayfrom;
    var timefrom;
    var dayto;
    var timeto;

    // Converts given phone number into only numbers
    $("#phone").change(function() {
        var sol ="";
        // Loop through given input
        for(var idx = 0; idx < phone.length; idx++) {
            var dig = phone.charAt(idx);

            // If the type of the character is number then it's part of our phone number
            if(typeof parseInt(dig,10) ==='number' && 	(dig%1)===0) {
                sol += dig;
            }
        }

        // Checks if the final phone number is valid
        // <3_digit_area_code> <7_digit_number>
        if(sol.length == 10) { this.phone = sol; }
        else { this.phone = ""; }
    });

    $("#dayfrom").change(function () {
        dayfrom = $("#dayfrom option:selected").text();

    });

    $("#timefrom").change(function () {
        timefrom = $("#timefrom option:selected").text();
    });

    $("#dayto").change(function () {
        dayto = $("#dayto option:selected").text();
    });

    $("#timeto").change(function () {
        timeto = $("#timeto option:selected").text();
    });

    $('#meetbtn').click(function () {
        var meetstring = "<p>" + dayfrom + " " + timefrom + " - " + dayto + " " + timeto + "</p>";
        $("#meetingheader").append(meetstring);
    });
});