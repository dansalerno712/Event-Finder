module.exports = {
    validateSave: function(req, res, next) {
        if (!req.body.id) {
            return res.status(400).json("missing id");
        }
        if (!req.body.url) {
            return res.status(400).json("missing url");
        }
        if (!req.body.eventName) {
            return res.status(400).json("missing eventName");
        }
        if (!req.body.venue) {
            return res.status(400).json("missing venue");
        }
        if (!req.body.dateTime) {
            return res.status(400).json("missing dateTime");
        }
        if (!req.body.type) {
            return res.status(400).json("missing type");
        }
        if (!req.body.location) {
            return res.status(400).json("missing location");
        }

        if (typeof req.body.id !== "string") return res.status(400).json("id must be a string");
        if (typeof req.body.url !== "string") return res.status(400).json("url must be a string");
        if (typeof req.body.eventName !== "string") return res.status(400).json("eventName must be a string");
        if (typeof req.body.venue !== "string") return res.status(400).json("venue must be a string");
        if (typeof req.body.dateTime !== "string") return res.status(400).json("dateTime must be a string");
        if (typeof req.body.type !== "string") return res.status(400).json("type must be a string");
        if (typeof req.body.location !== "object") return res.status(400).json("location must be a string");
        if (typeof req.body.location.city !== "string") return res.status(400).json("location.city must be a string");
        if (typeof req.body.location.latitude !== "string") return res.status(400).json("location.latitude must be a string");
        if (typeof req.body.location.longitude !== "string") return res.status(400).json("location.longitude must be a string");
        if (typeof req.body.location.postalCode !== "string") return res.status(400).json("location.postalCode must be a string");
        
        return next();
    },
    validateShare: function(req, res, next) {
         if (!req.body.toUser) {
            return res.status(400).json("missing toUser");
        }
        if (!req.body.eventID) {
            return res.status(400).json("missing eventID");
        }

        if (typeof req.body.toUser !== "string") return res.status(400).json("toUser must be a string");
        if (typeof req.body.eventID !== "string") return res.status(400).json("eventID must be a string");

        return next();
    },
    validateUnsave: function(req, res, next) {
        if (!req.body.id) {
            return res.status(400).json("missing id");
        }
        if (typeof req.body.id !== "string") return res.status(400).json("id must be a string");

        return next();
    },
    validateUnshare: function(req, res, next) {
         if (!req.body.username) {
            return res.status(400).json("missing username");
        }
        if (!req.body.eventID) {
            return res.status(400).json("missing eventID");
        }

        if (typeof req.body.username !== "string") return res.status(400).json("username must be a string");
        if (typeof req.body.eventID !== "string") return res.status(400).json("eventID must be a string");

        return next();
    }
}