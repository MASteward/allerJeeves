
var userStatus;

function checkStatus() {
  $.get("api/user_data").then(function(status) {
    userStatus = status;
    if (status.id !== undefined) {
      console.log("Signed-In");
      $("#loginBtn").toggle("disabled");
      $("#currentName").append("Welcome ", status.firstName);
    } else {
      console.log("Not Signed-In");
      $("#signOut").toggle("disabled");
      $(".fav-link").css("display", "none");
      $(".add-to-favorites").toggleClass("disabled");
    }
  });
}

checkStatus();

var indexNumber;
var recipe;
var recipeFavorites = [];
var searchRecipes = [];
var cardInfo = [];
var searchObj = [];
var homeLogin = false;

$(document).ready(function(){
  // GRAB DATA FROM LOCAL STORAGE FOR RECIPE REQUEST
  var recipeData = JSON.parse(localStorage.getItem("data"));
  if (recipeData == null){
    console.log("no data sent");
  } else if (recipeData[0].favorite) {
    homeLogin = true;
    cardCreation(recipeData);
  } else {
    formatImages(recipeData);
  }

  var restrictString = "&allowedAllergy[]=";
  //starting format for concatination for diret restrictions
  var dietString = "&allowedDiet[]=";
  //intital string for allergy
  var allergyRequest = "";
  //intital string for diet
  var dietRequest = "";

  //=========== CHECKS/UNCHECKS FILTERS ===============

  $("#restrictions").on("click", "input", function(){
    $(".allergy").prop("checked");
    $(".diet").prop("checked");
    console.log($(this).val());
  })

  //============== DIETARY FILTERS =====================

  var checkButtons = function(){
    $(".diet").each(function(){
      if ($(this).prop("checked")){
        var restrict = $(this).val().trim();
        dietRequest += (dietString + restrict);
        console.log("diet", dietRequest);
      }
    });

    $(".allergy").each(function(){
      if ($(this).prop("checked")){
        var restrict = $(this).val().trim();
        allergyRequest += (restrictString + restrict);
        console.log("allergy", allergyRequest);
      }
    });
    createURL();
  };

  //=============== NEW SEARCH ======================

    // Submit button is clicked
  $(".submitRecipe").click(function(event) {
    event.preventDefault();
    homeLogin = false;
    $(".outputArea").empty();
    userInput = $("#recipeSearch").val().trim();
    console.log("click", userInput);
    checkButtons();
  });

  //============== RECIPE SEARCH REQUEST ===============

  function createURL() {
    URL = "https://api.yummly.com/v1/api/recipes?_app_id=87e47442&_app_key=11e4aadcc3dddb10fa26ae2968e1ce03&q=" + userInput + allergyRequest + dietRequest + "&maxResult=20";
    callAjax(URL);
  };

  function callAjax(URL) {
    $.ajax({
      url: URL,
      method: "GET"
      //once myObj object returns, pass in myObj to the next function
    }).then(function(results) {
      var newRecipe = results.matches;
      formatImages(newRecipe);
    });
  };


  //================ IMAGES ====================

  function formatImages(data) {
    var imageInfo = data;

    imageInfo.forEach(function(image) {
      image.imageUrl = image.imageUrlsBySize[90].toString().replace("s90", "s400");
      image.imageUrl = image.imageUrl.toString().replace("http://", "https://");
      image.name = image.recipeName;
    });

    localStorage.removeItem("data");
    localStorage.setItem("data", JSON.stringify(imageInfo));

    cardCreation(imageInfo)
  }


  //=============== CARD CREATION ====================

  function cardCreation(newData) {
    cardInfo = newData;

    if (newData[0].favorite) {
      recipeFavorites = newData;
    } else {
      searchRecipes = newData;
    }

    for (var i = 0; i < cardInfo.length; i++) {
      var card = $("<div class='col-md-3 card' data-toggle='modal' data-target='#myModal' data-number="+[i]+" data-id=" + cardInfo[i].id + " data-favorite=" + cardInfo[i].favorite +">");

      var cardImg = $("<img class='card-img-top' src="+ cardInfo[i].imageUrl +" alt='Card image cap'>");

      var cardBody = $("<div class='card-body'>");

      var cardTitle = $("<h5 class='card-title'>"+ cardInfo[i].name +"</h5>");

      cardBody.append(cardTitle);
      card.append(cardImg);
      card.append(cardBody);

      if (cardInfo[i].favorite){
        if (homeLogin) {
          $(".outputArea").append(card);
        } else {
          $(".favorite-area").append(card);
        }
      } else {
        $(".outputArea").append(card);
      }
    };
  }

//=============== CARD CLICK TO INITATE MODAL ====================

  $(".outputArea").on("click", ".card", function(){
    indexNumber = $(this).data("number");
    console.log(indexNumber);
    var favCheck = $(this).data("favorite");
    if (favCheck == true) {
      createModal(recipeFavorites[indexNumber]);
    } else {
      getIngredients(searchRecipes[indexNumber]);
    }
  });

//=============== AJAX REQUEST RECIPE DETAILS FOR CLICKED CARD ====================

  function getIngredients(recipeInfo) {
    var recipeURL = "https://api.yummly.com/v1/api/recipe/" + recipeInfo.id + "?_app_id=87e47442&_app_key=11e4aadcc3dddb10fa26ae2968e1ce03";
    $.ajax({
      "url": recipeURL,
      "method": "GET"
    }).then(function(response) {
      response.imageUrl = response.images[0].imageUrlsBySize[90].toString().replace("s90", "s400");
      response.imageUrl = response.imageUrl.toString().replace("http://", "https://");
      response.source = response.source.sourceRecipeUrl;
      recipe = response;

      createModal(response);
    });
  };

//=============== CREATE MODAL ====================
  // Same modal is used to display recipe details for favorite's card and search results card.
  // The if statements are used to decipher what features to include in the modal
  function createModal(recipeData){
    // Modal Header Title
    $(".modal-title").append(recipeData.name);
    // Modal Recipe Image
    $(".modal-img").attr("src", recipeData.imageUrl);
    // Instructions Button Source
    $(".modal-instructions").attr("href", recipeData.source);

    // Insert add to favorites star if not loading favorites...else add a remove button to remove recipe from favorites
    if (recipeData.favorite == undefined) {
      if (userStatus.id) {
        $(".add-to-favorites").append("<i class='fas fa-star' data-id=" + recipeData.id + "></i>");
      } else {
        $(".add-to-favorites").append("<i class='fas fa-star disabled' data-id=" + recipeData.id + "></i>");
      }
    } else {
      var removeBtn = $("<div><button type='button' class='btn btn-outline-secondary remove' data-id=" + recipeData.id + ">Remove</button></div>");
      $(".removeButton").html(removeBtn);
    }

    // IF COOKTIME IS NOT UNDEFINED DISPLAY TO MODAL
    if (recipeData.cookTime !== undefined && recipeData.cookTime !== null) {
      $(".modal-cookTime").append("<span class='cookTimeTitle'>Cook Time</span>: " + recipeData.cookTime);
    }

    // IF TOTALTIME IS NOT UNDEFINED DISPLAY TO MODAL
    if (recipeData.totalTime !== undefined && recipeData.totalTime !== null) {
      $(".modal-totalTime").append("<span class='cookTimeTitle'>Total Time</span>: " + recipeData.totalTime);
    }

    // IF YEILD IS NOT UNDEFINED DISPLAY TO MODAL
    if (recipeData.yield !== undefined && recipeData.yield !== null) {
      $(".modal-servings").append("<span class='cookTimeTitle'>Servings</span>: " + recipeData.yield);
    }

    // PREVENT INGREDIENTS FROM BEING REPEATED (ISSUE W/ YUMMLY)
    var ingredients = recipeData.ingredientLines;
    $.each(ingredients, function(i, ingredient) {
      if (ingredient !== ingredients[(i - 1)]) {
        $(".ingredients-list").append("<li>" + ingredient + "</li>");
      }
    })
    // $(".modal-instructions").attr("href", recipeData.source.sourceRecipeUrl);

  };


//=============== CLOSE AND CLEAR RECIPE DETAILS ====================
  // Any time the recipe modal is exited, clear all the information so it is not duplicated on next click
  $(".footer-modal").on("click", ".exit", function() {
    $(".modal-title").empty();
    $(".modal-img").empty();
    $(".ingredients-list").empty();
    $(".modal-cookTime").empty();
    $(".modal-totalTime").empty();
    $(".modal-servings").empty();
    $(".add-to-favorites").empty();
    console.log("cleared");
  });

// ================ ADD TO FAVORITES ================

$(".add-to-favorites").on("click", ".fas", function() {
  if (userStatus.id) {
    $(this).toggleClass("filled");
    // CHANGED SOURCE FROM SOURCE.SOURCEURL
    var ingredientLinesJoin = recipe.ingredientLines.join();
    searchObj = {
      "recipeId": recipe.id,
      "name": recipe.name,
      "imageUrl": cardInfo[indexNumber].imageUrl,
      "ingredientLines": recipe.ingredientLines.join(),
      "totalTime": recipe.totalTime,
      "cookTime": recipe.cookTime,
      "yield": recipe.yield,
      "source": recipe.source,
      "favorite": true,
      "UserId": userStatus.id
    };
    $.post("api/recipe", searchObj, function(){
      console.log("data stored");
    })
  } else {
    return;
  }
})

// ================ GET FAVORITES ================

  $(".fav-link").click(function() {
    // $(".favorite-area").empty();
    getFavorites();
  });

  function getFavorites() {
    $(".favorite-area").empty();
    $.get("/api/recipe/" + userStatus.id).then(function(data) {
      recipes = data;
      recipes.forEach(function(recipeDetails) {
        recipeDetails.ingredientLines = recipeDetails.ingredientLines.split(",");
      });
      cardCreation(recipes);
    });
  };

  $(".removeButton").on("click", ".remove", function() {
    favCardId = $(this).data("id");
    deleteRecipe(favCardId);
  });

  function deleteRecipe(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/recipe/" + favCardId
    }).then(function(response) {
      console.log("RESPONSE", response);
      $(".recipe-close").click();
      getFavorites();
      // $(".fav-link").click();
    })
  }





// ================ INITIATE FAVORITES MODAL ================

  $(".favorite-area").on("click", ".card", function(){
    indexNumber = $(this).data("number");

    var favDetails = recipes[indexNumber];

    createModal(favDetails);
  });


//==================== LOGIN MODAL ======================

  // When the form is submitted, we validate there's an email and password entered
  $("form.login").on("submit", function(event) {
    event.preventDefault();
    var userData = {
      email: $("input#email-login").val().trim(),
      password: $("input#password-login").val().trim()
    };

    if (!userData.email || !userData.password) {
      return;
    }
    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
  });

// loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.post("/api/login", {
      email: email,
      password: password
    }).then(function(data) {

      window.location.replace(data.reroute);
      cardCreation();
      // If there's an error, log the error
    }).catch(function(err) {
      console.log(err);
    });
    checkStatus();

  }

  //=================== SIGN UP ====================

  // var firstName = ;
  // var lastName = ;
  // var emailSignup = ;
  // var passwordSignup = ;
  // var confirm = $("input#password-confirm");

  // When the signup button is clicked, we validate the email and password are not blank
  $("form.signup").on("submit", function(event) {
    event.preventDefault();
    var userData = {
      firstName: $("input#firstName").val().trim(),
      lastName: $("input#lastName").val().trim(),
      email: $("input#email-signup").val().trim(),
      password: $("input#password-signup").val().trim(),
      confirm: $("input#password-confirm").val().trim()
    };

    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || userData.password !== userData.confirm) {
      console.log("returned this");
      return;
    } else {
      signUpUser(userData);
    }
  });


  // Does a post to the signup route. If succesful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userInfo) {
    $.post("/api/signup", {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      password: userInfo.password
    }).then(function(data) {
      window.location.reload();
      console.log("signed up");
    }).catch(handleLoginErr);
  };

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  };

});
