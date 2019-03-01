const express = require("express");
const router = express.Router();
const Events = require("../data").events
const Users = require("../data").users
const moment = require("moment");
const mid = require("../middleware/profileValidation");

// get shared events info - need to do this one by one since order is not preserved
// in find in mongo
async function getSharedEventInfo(sharedEvents) {
    let ret = [];

    // this loop goes in reverse so that the newest event shares are at the top of
    // the page
    for(var i = sharedEvents.length - 1; i >= 0; i--) {
        let event = await Events.getEventById(sharedEvents[i].eventID);
        event.username = sharedEvents[i].username;
        ret.push(event);
    };

    return ret; 
}

function formatDates(events) {
    events.forEach(e => {
        const formattedDate = moment(e.dateTime).format('MMMM Do YYYY, h:mm a');
        if (e === "Invalid Date") {
            e.dateTime = "Check website for times";
        } else {
            e.dateTime = formattedDate;
        }
    })

    return events;
}

router.get("/", async (req, res) => {
    try {
        let savedEvents = await Events.getEventsByIDs(req.authedUser.savedEvents);
        let sharedEvents = await getSharedEventInfo(req.authedUser.sharedEvents);

        savedEvents = formatDates(savedEvents);
        sharedEvents = formatDates(sharedEvents);

        res.render("profile", {savedEvents: savedEvents, sharedEvents: sharedEvents});
    } catch (e) {
        console.log(e);
        res.render("profile", {error: "Could not retrieve saved/shared events"})
    }
})

router.post("/save", mid.validateSave, async (req, res) =>{
    try{
        // make a new object unless i find a better way to rename
        // and remove fields
        let eventToSave = {
            _id: req.body.id,
            url: req.body.url,
            eventName: req.body.eventName,
            venue: req.body.venue,
            dateTime:  moment(req.body.dateTime, "MMMM Do YYYY, h:mm a").toDate(),
            type: req.body.type,
            location: req.body.location
        }

        // save event and add to user's saved event list
        const savedEvent = await Events.saveEvent(eventToSave);
        await Users.saveEvent(req.authedUser._id, savedEvent._id);
        res.json('done')
    }catch(e){
        console.log(e)
        res.status(500).json("An unexpected error occurred");
    }
});

router.post("/unsave", mid.validateUnsave, async (req, res) =>{
    try{
        // Remove the event from the user's saved list. We aren't removing
        // the event from the DB because other users can still have that event saved
        await Users.unsaveEvent(req.authedUser._id, req.body.id);
        res.json('done')
    }catch(e){
        console.log(e);
        res.status(500).json("An unexpected error occurred");
    }
});

router.post("/share", mid.validateShare, async (req, res) => {
    try {
        // share the event
        await Users.shareEvent(req.authedUser.username, req.body.toUser, req.body.eventID);
        res.json("done");
    } catch (e) {
        // send userful error text
        if (e === "Error: No user found") {
            return res.status(404).json("No user found");
        } else if (e === "Error: Can't share with yourself") {
            return res.status(403).json("You can't share with yourself");
        }
        console.log(e);
        return res.status(500).json("An unexpected error occurred");
    }
});

router.post("/unshare", mid.validateUnshare, async (req, res) => {
    try {
        await Users.removeSharedEvent(req.authedUser._id, req.body.eventID, req.body.username);
        res.json("done");
    } catch (e) {
        console.log(e);
        return res.status(500).json("An unexpected error occurred");
    }
})

module.exports = router;