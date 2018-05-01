

$(document).ready(function(){
  var userStatus;

  function checkStatus() {
    $.get("api/user_data").then(function(status) {
      userStatus = status;
      if (status.id !== undefined) {
        console.log("Signed-In");
        $("#loginBtn").toggle();
        $("#currentName").append("Welcome ", status.firstName);
      } else {
        console.log("Not Signed-In");
        $("#signOut").toggle();
        // $(".fav-link").css("display", "none");
      }
    });
  }

  checkStatus();

  var restrictString = "&allowedAllergy[]=";
  //starting format for concatination for diret restrictions
  var dietString = "&allowedDiet[]=";
  //intital string for allergy
  var allergyRequest = "";
  //intital string for diet
  var dietRequest = "";

  //=========== CHECKS/UNCHECKS FILTERS ===============

  $(".foodOptions").on("click", "input", function(){
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
    createSearch();
  };

//============= RECIPE SEARCH ================

  $("#inputBtn").on("click", function(event){
    event.preventDefault();
    userInput = $("#foodSearch").val().trim();
    console.log("click", userInput);
    checkButtons();
  });

  $("#foodSearch").keyup(function(event){
    if (event.keyCode == 13) {
      userInput = $("#foodSearch").val().trim();
      console.log("enter", userInput);
      checkButtons();
    }
  });

//============== AJAX REQ =========================

  function createSearch() {
    URL = "https://api.yummly.com/v1/api/recipes?_app_id=87e47442&_app_key=11e4aadcc3dddb10fa26ae2968e1ce03&q=" + userInput + allergyRequest + dietRequest + "&maxResult=20";
    $.ajax({
      url: URL,
      method: "GET"
      //once myObj object returns, pass in myObj to the next function
    }).then(function(results) {
      var data = results.matches;
      console.log(data);
      localStorage.removeItem("data");
      localStorage.setItem("data", JSON.stringify(data));
      window.location.href= "/recipe";
    });
  };



//==================== LOGIN MODAL ======================

// var loginForm = $("form.login");
  // var emailLogin = ;
  // var passwordLogin = ;

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
    localStorage.clear();
    $.post("/api/login", {
      email: email,
      password: password
    }).then(function(data) {
      loadFavorites(data);
    }).catch(function(err) {
      console.log(err);
    });
    checkStatus();
  }

  function loadFavorites(userInfo) {
    $.get("/api/recipe/" + userInfo.id)
    .then(function(results) {
      console.log("YOUR", results);
      if (results[0] == undefined) {
        window.location.reload();
      } else {
        recipes = results;
        recipes.forEach(function(recipeDetails) {
          recipeDetails.ingredientLines = recipeDetails.ingredientLines.split(",");
        });
        saveLocal(recipes);
      }
    });
  };

  function saveLocal(favoritesData) {
    localStorage.setItem("data", JSON.stringify(favoritesData));
    console.log("Favorites", favoritesData);
    window.location.replace("/recipe");
  }

  //=================== SIGN UP ====================

  // var firstName = ;
  // var lastName = ;
  // var emailSignup = ;
  // var passwordSignup = ;
  // var confirm = $("input#password-confirm");

  // When the signup button is clicked, we validate the email and password are not blank
  $("form.signup").on("submit", function(event) {
    console.log("signup motherf*ck");
    event.preventDefault();
    var userData = {
      firstName: $("input#firstName").val().trim(),
      lastName: $("input#lastName").val().trim(),
      email: $("input#email-signup").val().trim(),
      password: $("input#password-signup").val().trim(),
      confirm: $("input#password-confirm").val().trim()
    };
    console.log(userData.confirm);

    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || userData.password !== userData.confirm) {
      console.log("return this");
      return;
    } else {
      console.log("signupUser");
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
