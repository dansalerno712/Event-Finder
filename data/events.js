const mongoCollections = require("../config/mongoCollections");
const events = mongoCollections.events;

// if you get this error for bcrypt -> dyld: lazy symbol binding failed:
// DO THIS: npm rebuild bcrypt --build-from-source

module.exports = {
    getEventById: async function(id) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (typeof id !== "string") throw "Error: id must be a string";

        // get collection and find
        const eventCollection = await events();
        const foundEvent = await eventCollection.findOne({
            _id: id
        });

        // make sure you actually found something
        if (!foundEvent) throw "Error: user not found";
        return foundEvent;
    },
    getEventsByIDs: async function(idArr) {
        // error check
        if (!idArr) throw "Error: must provide an id array";
        if (!Array.isArray(idArr)) throw "Error: idArr must be an array";
        idArr.forEach(id => {
            if (typeof id !== "string") throw "Error: id must be a string"
        })

        const eventCollection = await events();
        // also sort so that oldest events show up first
        const foundEvents = await eventCollection.find({
            _id: {
                $in: idArr
            }
        }).sort({
            dateTime: 1
        }).toArray();

        return foundEvents;
    },
    saveEvent: async function(event) {
        //error check
        if (!event._id) throw "Error: must provide an id";
        if (!event.url) throw "Error: must provide a url";
        if (!event.eventName) throw "Error: must provide an event name";
        if (!event.venue) throw "Error: must provide a venue";
        if (!event.dateTime) throw "Error: must provide a dateTime";
        if (!event.type) throw "Error: must provide a event type";
        if (!event.location) throw "Error: must provide a location";

        if (typeof event._id !== "string") throw "Error: id must be a string";
        if (typeof event.url !== "string") throw "Error: url must be a string";
        if (typeof event.eventName !== "string") throw "Error: event name must be a string";
        if (typeof event.venue !== "string") throw "Error: venue must be a string";
        if (!event.dateTime instanceof Date) throw "Error: dateTime must be a date";
        if (typeof event.type !== "string") throw "Error: event type must be a string";
        if (typeof event.location !== "object") throw "Error: location must be a object";
        if (typeof event.location.city !== "string") throw "Error: city must be a string";
        if (typeof event.location.latitude !== "string") throw "Error: latitude must be a string";
        if (typeof event.location.longitude !== "string") throw "Error: longitude must be a string";
        if (typeof event.location.postalCode !== "string") throw "Error: postalCode must be a string";

        // get collection
        const eventCollection = await events();
        const foundEvent = await eventCollection.findOne({
            _id: event._id
        });

        // if the event already exists, dont add it
        if (foundEvent) {
            return foundEvent;
        } else {
            // add it
            const insertInfo = await eventCollection.insertOne(event);
            if (insertInfo.insertedCount === 0) throw "Error: could not insert event";

            return await this.getEventById(insertInfo.insertedId);
        }
    }
}