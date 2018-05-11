var path = require("path");
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  app.get("/", function(req, res) {
    // if (req.user) {
    //   res.redirect("/recipe");
    // }
    res.sendFile(path.join(__dirname, "../public/home.html"));
  });

  app.get("/recipe", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/recipe.html"));
  })

};
