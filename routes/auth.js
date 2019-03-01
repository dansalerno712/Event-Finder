const express = require("express");
const router = express.Router();
const authValidation = require("../middleware/authValidation");
const Users = require("../data").users
const bcrypt = require("bcrypt");
const uuidv4 = require("uuid/v4");
const isLoggedIn = require("../middleware/auth").isLoggedIn;


// render the login page
router.get("/login", async (req, res) => {
    res.render('login')
});

router.post("/login", authValidation.loginValidator, async (req, res) => {
    try {
        // find the user
        let user = await Users.getUserByUsername(req.body.username);

        // compare passwords
        let check = false;
        try {
            check = await bcrypt.compare(req.body.password, user.password);
        } catch (e) {
            //no op
        }
        // if bad password bring back to login page
        if (!check) {
            return res.status(404).render("login", {error: "Invalid password"});
        }

        // set cookie and session
        const sessionID = uuidv4();
        const options = {
            maxAge: 24* 60 * 60 * 1000,
            httpOnly: true
        };
        res.cookie("AuthCookie", sessionID, options);
        await Users.setUserSession(user._id, sessionID);

        // render the profile page
        res.redirect("/profile");
    } catch (e) {
        // entered a bad username
        if (e === "Error: user not found") {
            return res.status(404).render("login", {error: "Invalid username"});
        }
        console.log(e);
        return res.status(500).render("login", {error: "An unexpected error occurred"});
    }
})

router.get("/signup", async (req, res) => {
    res.render('signup')
});

router.post("/signup", authValidation.signupValidator, async (req, res) => {
    try {
        // make the new user
        const newUser = await Users.addUser(req.body.username, req.body.password, req.body.email);
        // log them in
        const options = {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true
        };
        res.cookie("AuthCookie", newUser.sessionID, options);
        res.redirect("/");
    } catch (e) {
        // show errors for creating user
        if (e === "Username already exists" || e === "Email already exists") {
            return res.render("signup", {
                error: e
            })
        }
        console.log(e);
        res.status(500).render("signup", {
            error: "An unexpected error occurred"
        });
    }
})

router.get("/logout", async (req, res) => {
    try {
        // if they are logged in
        if (req.cookies.AuthCookie) {
            // clear the cookie
            await Users.clearUserSession(req.cookies.AuthCookie);
            res.clearCookie("AuthCookie");
        }
        // bring them back to home page
        res.redirect("/");
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
})

router.get("/delete", isLoggedIn, async (req, res) => {
    try {
        // delete the user and clear the auth cookie to log them out
        await Users.removeUser(req.authedUser._id);
        res.clearCookie("AuthCookie");
        res.redirect("/");
    } catch (e) {
        console.log(e);
        res.redirect("/profile");
    }
})

module.exports = router;