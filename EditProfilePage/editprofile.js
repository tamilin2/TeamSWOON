$(document).ready(function() {
   var numFields = 1;
    
    $(".add-schedule").click(function(e) {
        e.preventDefault();
        var addto = "#dayfrom" + numFields;
        var addRemove = "#" + numFields;
        numFields = numFields + 1;
        var newselects = '<div class="row">
            <div class="form-group col-md-2" >
                <select class="form-control" id="dayfrom' + numFields + '"name="dayfrom' + numFields + '" >
                    <option value="na">N/A</option>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <select class="form-control" id="timefrom' + numFields + '" name="timefrom' + numFields + '">
                    <option value="na">N/A</option>
                    <option value="12am">12:00am</option>
                    <option value="1230am">12:30am</option>
                    <option value="1am">1:00am</option>
                    <option value="130am">1:30am</option>
                    <option value="2am">2:00am</option>
                    <option value="230am">2:30am</option>
                    <option value="3am">3:00am</option>
                    <option value="330am">3:30am</option>
                    <option value="4am">4:00am</option>
                    <option value="430am">4:30am</option>
                    <option value="5am">5:00am</option>
                    <option value="530am">5:30am</option>
                    <option value="6am">6:00am</option>
                    <option value="630am">6:30am</option>
                    <option value="7am">7:00am</option>
                    <option value="730am">7:30am</option>
                    <option value="8am">8:00am</option>
                    <option value="830am">8:30am</option>
                    <option value="9am">9:00am</option>
                    <option value="930am">9:30am</option>
                    <option value="10am">10:00am</option>
                    <option value="1030am">10:30am</option>
                    <option value="11am">11:00am</option>
                    <option value="1130am">11:30am</option>
                    <option value="12pm">12:00pm</option>
                    <option value="1230pm">12:30pm</option>
                    <option value="1pm">1:00pm</option>
                    <option value="130pm">1:30pm</option>
                    <option value="2pm">2:00pm</option>
                    <option value="230pm">2:30pm</option>
                    <option value="3pm">3:00pm</option>
                    <option value="330pm">3:30pm</option>
                    <option value="4pm">4:00pm</option>
                    <option value="430pm">4:30pm</option>
                    <option value="5pm">5:00pm</option>
                    <option value="530pm">5:30pm</option>
                    <option value="6pm">6:00pm</option>
                    <option value="630pm">6:30pm</option>
                    <option value="7pm">7:00pm</option>
                    <option value="730pm">7:30pm</option>
                    <option value="8pm">8:00pm</option>
                    <option value="830pm">8:30pm</option>
                    <option value="9pm">9:00pm</option>
                    <option value="930pm">9:30pm</option>
                    <option value="10pm">10:00pm</option>
                    <option value="1030pm">10:30pm</option>
                    <option value="11pm">11:00pm</option>
                    <option value="1130pm">11:30pm</option>
                </select>
            </div>
            <div class="form-group col-md-2">
                <select class="form-control" id="dayto' + numFields + '" name="dayto' + numFields + '">
                    <option value="na">N/A</option>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <select class="form-control" id="timeto' + numFields + '" name="timeto' + numFields + '">
                    <option value="na">N/A</option>
                    <option value="12am">12:00am</option>
                    <option value="1230am">12:30am</option>
                    <option value="1am">1:00am</option>
                    <option value="130am">1:30am</option>
                    <option value="2am">2:00am</option>
                    <option value="230am">2:30am</option>
                    <option value="3am">3:00am</option>
                    <option value="330am">3:30am</option>
                    <option value="4am">4:00am</option>
                    <option value="430am">4:30am</option>
                    <option value="5am">5:00am</option>
                    <option value="530am">5:30am</option>
                    <option value="6am">6:00am</option>
                    <option value="630am">6:30am</option>
                    <option value="7am">7:00am</option>
                    <option value="730am">7:30am</option>
                    <option value="8am">8:00am</option>
                    <option value="830am">8:30am</option>
                    <option value="9am">9:00am</option>
                    <option value="930am">9:30am</option>
                    <option value="10am">10:00am</option>
                    <option value="1030am">10:30am</option>
                    <option value="11am">11:00am</option>
                    <option value="1130am">11:30am</option>
                    <option value="12pm">12:00pm</option>
                    <option value="1230pm">12:30pm</option>
                    <option value="1pm">1:00pm</option>
                    <option value="130pm">1:30pm</option>
                    <option value="2pm">2:00pm</option>
                    <option value="230pm">2:30pm</option>
                    <option value="3pm">3:00pm</option>
                    <option value="330pm">3:30pm</option>
                    <option value="4pm">4:00pm</option>
                    <option value="430pm">4:30pm</option>
                    <option value="5pm">5:00pm</option>
                    <option value="530pm">5:30pm</option>
                    <option value="6pm">6:00pm</option>
                    <option value="630pm">6:30pm</option>
                    <option value="7pm">7:00pm</option>
                    <option value="730pm">7:30pm</option>
                    <option value="8pm">8:00pm</option>
                    <option value="830pm">8:30pm</option>
                    <option value="9pm">9:00pm</option>
                    <option value="930pm">9:30pm</option>
                    <option value="10pm">10:00pm</option>
                    <option value="1030pm">10:30pm</option>
                    <option value="11pm">11:00pm</option>
                    <option value="1130pm">11:30pm</option>
                </select>
            </div>
        </div>';
    var newinput = $(newselects);
    var removeBtn = '<button id="remove' + (next - 1) + '"class="btn btn-danger remove-btn" >-</button>';
    var removeButton = $(removeBtn);
    $(addto).after(newinput);
    $(addRemove).after(removeButton);
    $("#")
    })
});