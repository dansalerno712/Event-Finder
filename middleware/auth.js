const users = require("../data").users;

module.exports = {
    setIsAuthenticated: async function(req, res, next) {
        try {
            if (req.cookies.AuthCookie) {
                const user = await users.getUserBySessionID(req.cookies.AuthCookie);
                // if they somehow have a cookie but its not valid, clear it
                req.authedUser = user;
                req.isAuthenticated = true;
                return next();
            } else {
                req.isAuthenticated = false;
                return next();
            }
        } catch (e) {
            console.log(e);
            if (e === "Error: user not found") {
                res.clearCookie("AuthCookie");
                req.isAuthenticated = false;
                return next();
            }
            res.sendStatus(500);
        }
    },
    isLoggedIn: async function(req, res, next) {
        if (req.isAuthenticated) {
            return next();
        } else {
            res.redirect("/");
        }
    }
}