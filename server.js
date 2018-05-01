var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var passport = require("./config/passport");


var app = express();
var PORT = process.env.PORT || 8080;
var db = require("./models");

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(session({ secret: "dancing dog", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());




// NEED ROUTES
require("./routes/html-routes.js")(app);
require("./routes/user-routes.js")(app);
require("./routes/recipe-routes.js")(app);

db.sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log("Server listening on PORT " + PORT);
  });
});
