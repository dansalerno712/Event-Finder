var map;

// function to initialze the map
function initMap() {
	//initializes map
	map = new google.maps.Map(document.getElementById('map'), {
		// center: {lat: 40.7589, lng: -73.9851},
		zoom: 13
	});
}

//marker array that will hold all markers created and allow for deletion of them
var markerArr = []

// function to display data points on map
function getPoints(locations, center, auth){ 
    if(!locations || !center) return;
    // Show map after user presses Find Events, then initialize the map
    document.getElementById('hideMap').style.display = 'block';
    if(!map) initMap(); 

    // Clear all previous markers existing on the map
    if(markerArr){
        for (var i = 0; i < markerArr.length; i++ ) {
            markerArr[i].setMap(null);
        }
        markerArr = []
    }
    // Pan map to the center of the postal code provided in the form
    map.panTo(new google.maps.LatLng(center.lat, center.lng))

    //allows for an info window when a user clicks on a marker
	var infowindow = new google.maps.InfoWindow({
		maxWidth: 300,
		// minWidth: 200
	})
	// loop through each location returned by our backend
	Object.keys(locations).forEach(k => {
		//get the coordinates of each location
		var coords = JSON.parse(k)

		// change grammar based on number of events found
        var eventPluralizer = (locations[k].length == 1 ? "Event Found at " : "Events Found at ")

        // add a marker for each location
		var marker = new google.maps.Marker({
			// set the position of the marker
	        position: new google.maps.LatLng(coords['latitude'], coords['longitude']),
	        // position: {"lat": Number(coords['latitude']), "lng": Number(coords['longitude'])},
	        // set a tooltip for the marker
	        title: locations[k].length.toString() + ' ' + eventPluralizer + locations[k][0]['venue'],
	        // map which will have markers be displayed on it
	        map: map,
    	});

    	// push all markers into an array
        markerArr.push(marker)

        // add an onClick listener to each marker that will display info regarding each location
    	marker.addListener('click', function() {
    		//content to be displayed within info window
    		// infowindow.setContent("<div class='title'>" + eventPluralizer + locations[k][0]['venue'] + ":</div>" + '<ol>' + contentString + '</ol>')
    		infowindow.setContent("<div class='title'>" + eventPluralizer + locations[k][0]['venue'] + ":</div>" + '<ol>' + getContentString(k, auth) + '</ol>')
    		// open infowindow on click
			infowindow.open(map, marker);
		});
	})
	// click anywhere on the map to close a currently opened infowindow
	map.addListener('click', function() {
		infowindow.close();
	})
}

function getContentString(position, auth){
	// set an empty contentString to allow for dynamic appending
	var contentString = ''
	var locations = JSON.parse(sessionStorage.parsedEvents)
	// loop through each event found at a location
	locations[position].forEach(eventObj =>{
		// append an ordered list of event names and times that has a url associated with each
		if(eventObj['saved']){
			var icon = '<i style="color: red" class="fa fa-bookmark" aria-hidden="true"></i>'
			var buttonIcon = '<button title="Unsave Event" class="btn" onclick="saveEvent(this, ' + JSON.parse(position)['latitude'] + ', ' + JSON.parse(position)['longitude'] + ')" data-eventId="' + eventObj['id'] + '" id="saveButton">'+ icon +'</button>'
		}else{
			var icon = '<i class="fa fa-bookmark-o" aria-hidden="true"></i>'
			var buttonIcon = '<button title="Save Event" class="btn" onclick="saveEvent(this, ' + JSON.parse(position)['latitude'] + ', ' + JSON.parse(position)['longitude'] + ')" data-eventId="' + eventObj['id'] + '" id="saveButton">'+ icon +'</button>'
		}
		var displayButton;
		auth ? displayButton = buttonIcon : displayButton = ''
		contentString += '<div class="row">' +
								'<div class="col-10">' +
									'<li>' +
										'<p><a target="_blank" href=' + eventObj['url'] + '>' + eventObj['eventName'] + ' - ' + eventObj['dateTime'] + '</a></p>' +
									'</li>' +
								'</div>' +
								'<div class="col offset-md-10">' +
									displayButton +
								'</div>' +
						'</div>'
	})
	return contentString
}

function saveEvent(element, lat, lng){
	// stringify this lat,lng object so that it can be used to search through our dict of locations
	var coords = JSON.stringify({"longitude": lng.toString(), "latitude": lat.toString()})

	// get the events stored in the session storage
	var parsedEvents = JSON.parse(sessionStorage.parsedEvents)

	// get the group of events within a location 
	var locationGroup = parsedEvents[coords]

	// looks through a group of events and returns the one with a matching ID to the event clicked
	var eventToSave = locationGroup.find(e => {
		return e['id'] == element.getAttribute('data-eventId')
	})

	
	// determine which route to post to depending on if the event was saved or not
	var postRequest = eventToSave['saved'] ? '/profile/unsave' : '/profile/save'

	$.ajax({
        url: postRequest,
        type: 'POST',
        timeout: 30 * 1000,
        dataType: "json",
        data: eventToSave,
        error: function (jqXHR, textStatus, errorThrown) {
            // Display errors sent from backend & Hide map
            if(jqXHR.responseJSON){
            	document.getElementById('alertsDiv').innerHTML = '<strong>' + jqXHR.responseJSON + '</strong>';
            } else {
            	document.getElementById('alertsDiv').innerHTML = '<strong>' + jqXHR['statusText'] + '</strong>';
            }
            // display/hide alerts
			document.getElementById('alertsDiv').style.display = 'block';
			document.getElementById('hideMap').style.display = 'none';
			document.getElementById('warningsDiv').style.display = 'none';
			// display submit buttons
			document.getElementById('submitButton').style.display = 'block';
			document.getElementById('loadButton').style.display = 'none';
        },
        success: function (data) {
        	// change the property in the object that says if an event was saved or not
			eventToSave['saved'] = !eventToSave['saved']
			// change HTML in the info window depending on if the event is saved or not
			if(eventToSave['saved']){
				element.innerHTML = '<i style="color: red" class="fa fa-bookmark" aria-hidden="true"></i>'
				element.title = 'Unsave Event'
			} else{
				element.innerHTML = '<i class="fa fa-bookmark-o" aria-hidden="true"></i>'
				element.title = 'Save Event'
			}
			// save the updated object into the session data 
			sessionStorage.setItem("parsedEvents", JSON.stringify(parsedEvents))
        }
    });

}

$(document).ready(function() {

});