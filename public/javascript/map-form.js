$(document).ready(function() {
    // Date Time Picker Settings
    $('#startDatetimepicker').datetimepicker({
        stepping: 15,
        format: 'MMMM Do YYYY, h:mm a',
        minDate: new Date,
        defaultDate: new Date
    })
    $('#endDatetimepicker').datetimepicker({
        stepping: 15,
        format: 'MMMM Do YYYY, h:mm a',
        minDate: new Date
    })

    // getting HTML elements
    var invalidEndTime = document.getElementById("endTimeMissing")
    var endTimeInput = $("#endDatetime")[0]
    var startTimeInput = $("#startDatetime")[0]
    var zipInput = $("#zip")[0]

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');

    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {

            // fix form validity reponse text
            invalidEndTime.innerHTML = "Please provide an end time."
            // set validity of these elements to true
            endTimeInput.setCustomValidity("")
            startTimeInput.setCustomValidity("")

            if (form.checkValidity() === false) {
                // if form is not valid, prevent submission
                event.preventDefault();
                event.stopPropagation();
            } else {
                // prevent submission
                event.preventDefault();
                // get all form data
                var formData = $('form').serializeArray();

                // this is the time format ticketmaster API expects
                var startTime = moment.utc(moment(formData[0]['value'], 'MMMM Do YYYY, h:mm a'))
                var endTime = moment.utc(moment(formData[1]['value'], 'MMMM Do YYYY, h:mm a'))

                // VALIDITION
                if (startTime.format() === 'Invalid date') {
                    startTimeInput.setCustomValidity("Invalid")
                }
                if (endTime.format() === 'Invalid date') {
                    endTimeInput.setCustomValidity("Invalid")
                }
                if (endTime < startTime) {
                    endTimeInput.setCustomValidity("Invalid")
                    invalidEndTime.innerHTML = "End time must be after start time"
                }
                if (form.checkValidity() === true) {
                    // hide submit button, show loading button
                    document.getElementById('submitButton').style.display = 'none';
                    document.getElementById('loadButton').style.display = 'block';
                    // payload to be sent to backend
                    var request_data = {
                        "Payload": {
                            "startDateTime": startTime.format(),
                            "endDateTime": endTime.format(),
                            "postalCode": form[2]["value"],
                            "radius": form[3]['value'],
                            "unit": form[4]['value']
                        }
                    };

                    var iconStr = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> '
                    // AJAX request to send payload to backend
                    $.ajax({
                        url: '/',
                        type: 'POST',
                        timeout: 30 * 1000,
                        dataType: "json",
                        data: request_data,
                        error: function(jqXHR, textStatus, errorThrown) {
                            // Display errors sent from backend & Hide map
                            if (jqXHR.responseJSON) {
                                document.getElementById('alertsDiv').innerHTML = iconStr + '<strong>' + jqXHR.responseJSON['Result']['Error'] + '</strong>';
                            } else {
                                document.getElementById('alertsDiv').innerHTML = iconStr + '<strong>' + jqXHR['statusText'] + '</strong>';
                            }
                            // display/hide alerts
                            document.getElementById('alertsDiv').style.display = 'block';
                            document.getElementById('hideMap').style.display = 'none';
                            document.getElementById('warningsDiv').style.display = 'none';
                        },
                        success: function(data) {
                            // hide any alerts/warnings that may already be on screen
                            document.getElementById('alertsDiv').style.display = 'none';
                            document.getElementById('warningsDiv').style.display = 'none';

                            if (data['Result']['warnings']['rateLimit']) {
                                document.getElementById('warningsDiv').innerHTML = iconStr + '<strong>' + data['Result']['warnings']['rateLimit'] + '</strong>'
                                document.getElementById('warningsDiv').style.display = 'block';
                            }

                            // format data
                            formattedData = parseData(data['Result']['locations'], data['Result']['saved'])

                            //sort data
                            sortedPayload = sortEvents(formattedData)

                            if (typeof(Storage) !== "undefined") {
                                // sessionStorage.setItem("eventList", JSON.stringify(data['Result']['locations']));
                                sessionStorage.setItem("parsedEvents", JSON.stringify(sortedPayload))
                            } else {
                                // Sorry! No Web Storage support..
                            }

                            // send data to google maps javascript file
                            getPoints(sortedPayload, data['Result']['center'], data['Result']['auth']);

                            // smooth scroll to map on submission
                            $('html, body').animate({
                                scrollTop: $("#map").offset().top
                            }, 1000);
                        },
                        complete: function(jqXHR, textStatus) {
                            // display submit buttons, hide loading button
                            document.getElementById('submitButton').style.display = 'block';
                            document.getElementById('loadButton').style.display = 'none';
                        }
                    });
                }

            }
            // Bootstrap's way of validating a form if everything validates correctly
            form.classList.add('was-validated');
        }, false);
    });
});

function parseData(resEvents, savedEvents) {
    payload = {}
    // loop through each event found in the ticket master response
    resEvents.forEach(function(e) {
        // create an object with all the event details we want
        var eventObj = {}
        eventObj['type'] = e['type']
        eventObj['id'] = e['id']
        eventObj['url'] = e['url']
        savedEvents[e['id']] ? eventObj['saved'] = true : eventObj['saved'] = false;
        eventObj['eventName'] = e['name']
        eventObj['venue'] = e['_embedded']['venues'][0]['name']
        eventObj['location'] = {
            'city': e['_embedded']['venues'][0]['city']['name'],
            'latitude': e['_embedded']['venues'][0]['location']['latitude'],
            'longitude': e['_embedded']['venues'][0]['location']['longitude'],
            'postalCode': e['_embedded']['venues'][0]['postalCode']
        }
        eventObj['dateTime'] = moment(e['dates']['start']['dateTime'], moment.ISO_8601).format('MMMM Do YYYY, h:mm a')
        if (eventObj['dateTime'] === 'Invalid date') eventObj['dateTime'] = 'Check website for times'
        if (payload.hasOwnProperty(JSON.stringify(e['_embedded']['venues'][0]['location']))) {
            payload[JSON.stringify(e['_embedded']['venues'][0]['location'])].push(eventObj)
        } else {
            payload[JSON.stringify(e['_embedded']['venues'][0]['location'])] = [eventObj];
        }
    })
    return payload
}

// function to sort all of the events in the payload by date
function sortEvents(unsortedPayload) {
    var sortedPayload = {}
    Object.keys(unsortedPayload).forEach(location => {
        sortedPayload[location] = unsortedPayload[location].sort((a, b) => {
            return moment(a['dateTime'], 'MMMM Do YYYY, h:mm a').diff(moment(b['dateTime'], 'MMMM Do YYYY, h:mm a'))
        });
    });
    return sortedPayload
}