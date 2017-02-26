$(document).ready(function () {
    var meetings = [];
    var categories = [];
    var formdata;
    function ClubProfile(name, email, phone, site, description, categories, meetings) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.site = site;
        this. description = description;
        this.categories = categories;
        this.meetings = meetings;
    }
    
    function Meeting(startday, starttime, endday, endtime){
        this.startday = startday;
        this.starttime = starttime;
        this.endday = endday;
        this.endtime = endtime;
    }
    
    $(".meetfield").change(function() {
        var incomplete = false;
        $("form select").each(function () {
        
            if ($(this).val() == "na") {
                incomplete = true;
            }
        });
        
        if(incomplete){
            $("#meetbtn").addClass("disabled");
        } else {
            $("#meetbtn").removeClass("disabled");
        }
    })
    
    $("#meetbtn").click(function() {
        var meeting = $(".meetfield").serializeArray();
        var meet = new Meeting(meeting[dayfrom], meeting[timefrom], meeting[dayto], meeting[timeto]);
        meetings.push(meet);
        console.log(meet);
    });
    
    $("#submitbtn").click(function() {
        formdata = $(".tfield").serializeArray();
        console.log(formdata);
        alert("Your profile has been created!");
    });
    
    
});