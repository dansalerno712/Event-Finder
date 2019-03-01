module.exports = {
    signupValidator: async function(req, res, next) {
        const usernameRegex = /[A-Za-z0-9_-]+$/
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
        const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*_-]).{8,}$/

        if (!req.body.username) {
            return res.status(400).render("signup", {error: "Please provide a username."})
        }

        if (!req.body.username.match(usernameRegex)) {
            return res.status(400).render("signup", {error: "Please provide a username with only letters, numbers, dashes, or underscores."})
        }

        if (!req.body.email) {
            return res.status(400).render("signup", {error: "Missing email."})
        }

        if (!req.body.email.match(emailRegex)) {
            return res.status(400).render("signup", {error: "Please provide a valid email."})
        }

        if (!req.body.password) {
            return res.status(400).render("signup", {error: "Missing password."})
        }

        if (!req.body.password.match(passwordRegex)) {
            return res.status(400).render("signup", {error: "Passwords must be at least 8 characters and contain a letter, number, and special character (!@#$%^&*_-)."})
        }

        if (!req.body.confirmPassword) {
            return res.status(400).render("signup", {error: "Missing confirm password."})
        }

        if (!req.body.confirmPassword.match(passwordRegex)) {
            return res.status(400).render("signup", {error: "Passwords must be at least 8 characters and contain a letter, number, and special character (!@#$%^&*_-)."})
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).render("signup", {error: "Passwords do not match."})
        }

        return next();
    },
    loginValidator: async function(req, res, next) {
        if (!req.body.username) {
            return res.status(400).render("login", {error: "Please enter a username."})
        }
        if (!req.body.password) {
            return res.status(400).render("login", {error: "Please enter a password."})
        }

        return next();
    }
}