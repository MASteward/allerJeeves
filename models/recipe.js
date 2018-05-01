
module.exports = function(sequelize, DataTypes) {
  var Recipe = sequelize.define("Recipe", {
    "recipeId": {
      type: DataTypes.STRING,
      allowNull: false
    },
    "name": {
      type: DataTypes.STRING,
      allowNull: false
    },
    "ingredientLines": {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    "imageUrl": {
      type: DataTypes.STRING,
      allowNull: false
    },
    "totalTime": {
      type: DataTypes.STRING,
      allowNull: true
    },
    "cookTime": {
      type: DataTypes.STRING,
      allowNull: true
    },
    "yield": {
      type: DataTypes.STRING,
      allowNull: true
    },
    "source": {
      type: DataTypes.STRING,
      allowNull: false
    },
    "favorite": {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Recipe.associate = function(models) {
    // We're saying that recipes should belong to an User(Admin).
    // A recipe can't be created without an User(Admin) due to the foreign key constraint
    Recipe.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      },
    });
  };
  return Recipe;
};
