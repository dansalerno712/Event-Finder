const mainRoutes = require("./main");
const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const setIsAuthenticated = require("../middleware/auth").setIsAuthenticated;
const isLoggedIn = require("../middleware/auth").isLoggedIn;

const constructorMethod = app => {
    app.use("/", setIsAuthenticated, mainRoutes);
    app.use("/auth", setIsAuthenticated, authRoutes);
    app.use("/profile", setIsAuthenticated, isLoggedIn, profileRoutes);

  	app.use("*", (req, res) => {
    	res.status(404).json({ error: "Not found" });
  	});
};

module.exports = constructorMethod;