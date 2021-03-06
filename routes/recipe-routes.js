const db = require("../models");

module.exports = function(app) {
  app.get("/api/recipe/:id", function(req, res) {
    db.Recipe.findAll({
      where: {
        UserId: req.params.id
      }
    }).then(function(dbRecipe) {
      res.json(dbRecipe);
    })
  });

  app.post("/api/recipe", function(req, res) {
    console.log("req", req.body);
    db.Recipe.create(req.body).then(function(dbRecipe) {
      console.log(dbRecipe);
      res.json(dbRecipe);
    })
  });

  app.get("/api/user_recipes/", function(req, res) {
    db.Recipe.findAll({
      where: {
        UserId: req.user.id
      }
    }).then(function(dbRecipe) {
      console.log("favorite recipes");
      res.json(dbRecipe);
    });
  });

  app.delete("/api/recipe/:id", function(req, res) {
    db.Recipe.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbRecipe) {
      res.json(dbRecipe);
    })
  });
};
