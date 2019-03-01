const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuidv4 = require("uuid/v4");
const bcrypt = require("bcrypt");
const saltRounds = 16;
const Events = require("./events");
// if you get this error for bcrypt -> dyld: lazy symbol binding failed:
// DO THIS: npm rebuild bcrypt --build-from-source

module.exports = {
    getUserById: async function(id) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (typeof id !== "object") throw "Error: id must be an ObjectID";

        // get collection and find
        const userCollection = await users();
        const foundUser = await userCollection.findOne({
            _id: id
        });

        // make sure you actually found something
        if (!foundUser) throw "Error: user not found";
        return foundUser;
    },
    getUserByUsername: async function(username) {
        // error check
        if (!username) throw "Error: must provide a username";
        if (typeof username !== "string") throw "Error: username must be a string";

        // get collection and find
        const userCollection = await users();
        const foundUser = await userCollection.findOne({
            username: username
        });

        // make sure you actually found something
        if (!foundUser) throw "Error: user not found";
        return foundUser;
    },
    getUserByEmail: async function(email) {
        // error check
        if (!email) throw "Error: must provide a email";
        if (typeof email !== "string") throw "Error: email must be a string";

        // get collection and find
        const userCollection = await users();
        const foundUser = await userCollection.findOne({
            email: email
        });

        // make sure you actually found something
        if (!foundUser) throw "Error: user not found";
        return foundUser;
    },
    getUserBySessionID: async function(sessionID) {
        // error check
        if (!sessionID) throw "Error: must provide a sessionID";
        if (typeof sessionID !== "string") throw "Error: sessionID must be a string";

        // get collection and find
        const userCollection = await users();
        const foundUser = await userCollection.findOne({
            sessionID: sessionID
        });

        // make sure you actually found something
        if (!foundUser) throw "Error: user not found";
        return foundUser;
    },
    addUser: async function(username, password, email) {
        // error check
        if (!username) throw "Error: Missing username";
        if (!password) throw "Error: Missing password";
        if (!email) throw "Error: Missing email";
        if (typeof(username) !== "string") throw "Error: username must be a string";
        if (typeof(password) !== "string") throw "Error: password must be a string";
        if (typeof(email) !== "string") throw "Error: email must be a string";

        const userCollection = await users();

        let usernameUser = undefined;
        try {
            usernameUser = await this.getUserByUsername(username);
        } catch (e) {
            //no op
        }

        let emailUser = undefined;
        try {
            emailUser = await this.getUserByEmail(email);
        } catch (e) {
            //no op
        }

        if (usernameUser !== undefined) {
            throw "Username already exists"
        }
        if (emailUser !== undefined) {
            throw "Email already exists"
        }

        //TODO: Check if a user with that email/username already exists
        let newUser = {
            username: username,
            email: email,
            password: await bcrypt.hash(password, saltRounds),
            sessionID: uuidv4(),
            savedEvents: [],
            sharedEvents: []
        }

        const insertInfo = await userCollection.insertOne(newUser);
        if (insertInfo.insertedCount === 0) throw "Error: could not insert user";

        return await this.getUserById(insertInfo.insertedId);
    },
    setUserSession: async function(id, sessionID) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (typeof id !== "object") throw "Error: id must be an ObjectID";
        if (!sessionID) throw "Error must provide a sessionID";
        if (typeof(sessionID) !== "string") throw "Error sessionID must be a string"

        // make sure the recipe is in the collection before updating
        await this.getUserById(id);

        // mark what we are updating
        let userUpdateInfo = {
            sessionID: sessionID
        };

        // get collection, update, and return
        const userCollection = await users();
        await userCollection.updateOne({
            _id: id
        }, {
            $set: userUpdateInfo
        });

        return await this.getUserById(id);
    },
    clearUserSession: async function(sessionID) {
        // error check
        if (!sessionID) throw "Error must provide a sessionID";
        if (typeof(sessionID) !== "string") throw "Error sessionID must be a string"

        await this.getUserBySessionID(sessionID);

        // mark what we are updating
        let userUpdateInfo = {
            sessionID: undefined
        };

        // get collection, update, and return
        const userCollection = await users();
        await userCollection.updateOne({
            sessionID: sessionID
        }, {
            $set: userUpdateInfo
        });

        return true;
    },
    removeUser: async function(id) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (typeof id !== "object") throw "Error: id must be an ObjectID";

        // get collection
        const userCollection = await users();

        // delete and return
        const deletionInfo = await userCollection.removeOne({
            _id: id
        });

        if (deletionInfo.deletedCount === 0) throw `Error: could not remove user with id ${id}`;

        return true;
    },
    saveEvent: async function(id, eventID) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (typeof id !== "object") throw "Error: id must be an ObjectID";
        if (!eventID) throw "Error: must provide an event id";
        if (typeof eventID !== "string") throw "Error: event id must be a string";

        // grab the user
        const foundUser = await this.getUserById(id);

        // only add the event if it's not already added to their array
        let index = foundUser.savedEvents.indexOf(eventID);
        if (index !== -1) {
            return false;
        } else {
            // mark what we are updating and add the event to the user's saved array
            foundUser.savedEvents.push(eventID)
            let userUpdateInfo = {
                savedEvents: foundUser.savedEvents
            };

            // get collection, update, and return
            const userCollection = await users();
            await userCollection.updateOne({
                _id: id
            }, {
                $set: userUpdateInfo
            });

            return true;
        }
    },
    unsaveEvent: async function(id, eventID) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (typeof id !== "object") throw "Error: id must be an ObjectID";
        if (!eventID) throw "Error: must provide an event id";
        if (typeof eventID !== "string") throw "Error: event id must be a string";

        // get user
        const foundUser = await this.getUserById(id);

        // mark what we are updating (remove the eventID from the array)
        let userUpdateInfo = {
            savedEvents: foundUser.savedEvents.filter(id => id !== eventID)
        };

        // get collection, update, and return
        const userCollection = await users();
        await userCollection.updateOne({
            _id: id
        }, {
            $set: userUpdateInfo
        });

        return true;
    },
    // fromUser is the username of the person who is sharing
    // toUser is either username or email of who they want to share with
    // eventID is the id of event to share
    shareEvent: async function(fromUser, toUser, eventID) {
        //error check
        if (!fromUser) throw "Error: must provide fromUser";
        if (!toUser) throw "Error: must provide toUser";
        if (!eventID) throw "Error: must provide eventID";
        if (typeof(fromUser) !== "string") throw "Error: fromUser must be a string";
        if (typeof(toUser) !== "string") throw "Error: toUser must be a string";
        if (typeof(eventID) !== "string") throw "Error: eventID must be a string";

        // make sure fromUser is valid
        await this.getUserByUsername(fromUser);

        // toUser can be either email or username so make sure one of those exists
        let foundUser = undefined;
        try {
            foundUser = await this.getUserByUsername(toUser);
        } catch(e) {
            // no op
        }
        // not found by username, so try by email
        if (!foundUser) {
            try {
                foundUser = await this.getUserByEmail(toUser);
            } catch(e) {
                // no op
            }
        }
        // not found by both, so throw
        if (!foundUser) {
            throw "Error: No user found";
        } else if (foundUser.username === fromUser) {
            // dont share with yourself
            throw "Error: Can't share with yourself";
        } else {
            // make sure event is valid
            await Events.getEventById(eventID);

            // make sure this event + user combo has not been saved yet
            let exists = foundUser.sharedEvents.find(e => {
                return e.eventID === eventID && e.username === fromUser;
            })

            // if it's already shared, that's fine
            if (exists) {
                return true;
            } else {
                // add to their array
                foundUser.sharedEvents.push({
                    "eventID": eventID,
                    "username": fromUser
                });

                let userUpdateInfo = {
                    sharedEvents: foundUser.sharedEvents
                };

                // get collection, update, and return
                const userCollection = await users();
                await userCollection.updateOne({
                    _id: foundUser._id
                }, {
                    $set: userUpdateInfo
                });

                return true;
            }
        }
    },
    // id is the id of the user who wants to remove the shared event from their list
    // eventID is the id of the event
    // fromUser is the username of the person who shared with them
    removeSharedEvent: async function(id, eventID, fromUser) {
        // error check
        if (!id) throw "Error: must provide an id";
        if (!fromUser) throw "Error: must provide fromUser";
        if (!eventID) throw "Error: must provide eventID";
        if (typeof(fromUser) !== "string") throw "Error: fromUser must be a string";
        if (typeof(eventID) !== "string") throw "Error: eventID must be a string";
        if (typeof id !== "object") throw "Error: id must be an ObjectID";

        // get user
        const foundUser = await this.getUserById(id);

        // mark what we are updating
        let userUpdateInfo = {
            // remove the event we want
            sharedEvents: foundUser.sharedEvents.filter(e => {
                return e.eventID !== eventID || e.username !== fromUser
            })
        };


        // get collection, update, and return
        const userCollection = await users();
        await userCollection.updateOne({
            _id: id
        }, {
            $set: userUpdateInfo
        });

        return true;
    }
}