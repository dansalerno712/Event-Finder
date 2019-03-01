function shareEvent(element) {
    var eventID = element.getAttribute("data-id");
    // get the input
    var input = element.getElementsByTagName("input")[0]
    var toUser = input.value;

    // make request
    var requestData = {
        "eventID": eventID,
        "toUser": toUser
    }
    // DOM elements for later
    var alertsDiv = document.getElementById("alertsDiv-" + eventID);
    alertsDiv.style = "display: none;";
    var feedback = document.getElementById("feedback-" + eventID);
    $.ajax({
        url: '/profile/share',
        type: 'POST',
        timeout: 30 * 1000,
        dataType: "json",
        data: requestData,
        // put an alert with the error and an exclamation
        error: function(jqXHR, textStatus, errorThrown) {
            // alert(errorThrown);
            alertsDiv.style = "display: block;";
            alertsDiv.className = "alert alert-danger alert-dismissible fade show"
            feedback.innerHTML = "<i class='fa fa-exclamation-circle' aria-hidden='true' style='color: red;'></i>" + jqXHR.responseJSON;
        },
        // give positive feedback
        success: function(data) {
            alertsDiv.style = "display: block;";
            alertsDiv.className = "alert alert-success alert-dismissible fade show"
            feedback.innerHTML = "<i class='fa fa-check' aria-hidden='true' style='color: green;'></i>" + "Shared!";
        },
        // always clear the input
        complete: function() {
            input.value = "";
        }   
    });
}

function removeSharedEvent(element) {
    var eventID = element.getAttribute("data-eventID");
    // get the input
    var username = element.getAttribute("data-username");

    // make the request
    var requestData = {
        "eventID": eventID,
        "username": username
    };

    var alertsDiv = document.getElementById("alertsDiv-" + eventID + '-' + username);
    alertsDiv.style = "display: none;";
    var feedback = document.getElementById("feedback-" + eventID + '-' + username);
    $.ajax({
        url: '/profile/unshare',
        type: 'POST',
        timeout: 30 * 1000,
        dataType: "json",
        data: requestData,
        error: function(jqXHR, textStatus, errorThrown) {
            // alert(errorThrown);
            alertsDiv.style = "display: block;";
            alertsDiv.className = "alert alert-danger alert-dismissible fade show"
            feedback.innerHTML = "<i class='fa fa-exclamation-circle' aria-hidden='true' style='color: red;'></i>" + jqXHR.responseJSON;;
        },
        success: function(data) {
            var container = document.getElementById(eventID + "-" + username);
            var $item = $(container)
            $item.hide('slow', function(){ $item.remove(); });
        },   
    });
}

function removeSavedEvent(element) {
    var eventID = element.getAttribute("data-eventID");

    var requestData = {
        "id": eventID,
    };

    var alertsDiv = document.getElementById("alertsDiv-" + eventID);
    alertsDiv.style = "display: none;";
    var feedback = document.getElementById("feedback-" + eventID);
    $.ajax({
        url: '/profile/unsave',
        type: 'POST',
        timeout: 30 * 1000,
        dataType: "json",
        data: requestData,
        error: function(jqXHR, textStatus, errorThrown) {
            // alert(errorThrown);
            alertsDiv.style = "display: block;";
            alertsDiv.className = "alert alert-danger alert-dismissible fade show"
            feedback.innerHTML = "<i class='fa fa-exclamation-circle' aria-hidden='true' style='color: red;'></i>" + jqXHR.responseJSON;
        },
        success: function(data) {
            var container = document.getElementById(eventID);
            var $item = $(container)
            $item.hide('slow', function(){ $item.remove(); });
        },   
    });
}