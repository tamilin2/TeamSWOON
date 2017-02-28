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