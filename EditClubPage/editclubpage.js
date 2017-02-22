$(document).ready(function() {
    function ClubProfile(name, email, phn, site, description, meetings) {
        this.name = name;
        this.email = email;
        this.number = phn;
        this.site = site;
        this.description = description;
        this.meetings = meetings;
    }
    
    function Meeting(startday, starttime, endday, endtime) {
        this.startday = startday;
        this.starttime = starttime;
        this.endday = endday;
        this.endtime = endtime;
        function displayString() {
            return "<p>" + startday + " " + starttime + " " + " - " + endday + " " + endtime + "</p>";
        }
    }
    
    var name;
    var email;
    var phn;
    var site;
    var description;
    var startday;
    var starttime;
    var endday;
    var endtime;
    var meetings = [];
    var meetingcount=0;
    
    $("#clubname").change(function(){
        name = $("#clubname").val();
    });
    
    $("#email").change(function(){
        email = $("#email").val();
    });
    
    $("#phone").change(function(){
        phn = $("#phone").val();
    });
    
    $("#website").change(function(){
        site = $("#website").val();
    });
    
    $("#description").change(function(){
        description = $("#description").val();
    });

    $("#startday").change(function() {
        startday = $("#startday option:selected").text();
    });
    $("#starttime").change(function() {
        starttime = $("#starttime option:selected").text();
    });
    $("#endday").change(function() {
        endday = $("#endday option:selected").text();
    });
    $("#endtime").change(function() {
        endtime = $("#endtime option:selected").text();
    });
    
    $("#addmeeting").click(function() {
        meetings[meetingcount] = new Meeting(startday, starttime, endday, endtime);
        $("#meetingheader").append(meetings[meetingcount].displayString());
        meetingcount++;
    });
    
});