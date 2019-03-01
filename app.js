const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require("express-handlebars");
const app = express();
const configRoutes = require("./routes/index");

app.engine('hbs', exphbs({
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.use('/public', express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");

    if (process && process.send) process.send({
        done: true
    }); // ADD THIS LINE
});