//Declaring all of our dependencies:
const express = require("express");
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser()); //Checks if there's a cookie, then adds it to the cookie object
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["ilovebitsygirl"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//String generator to create unique shortURLs
function generateRandomString() {
  var randomString = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return (randomString);
};

//Repository for our URLs. Send data here to be included in the urls page.
const urlDatabase = {
  // Key/value pairs for shortURL are objects: shortUrl {longURL, userID}
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  jsm5xK: {longURL: "http://www.google.com", userID: "userRandomID"}
};

//Repository for our users' data. Send data here to register a new user/check data here for redundancies
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//Function to check existing user emails against proposed new user email:
const emailChecker = function(users, checkMail) {
  for(user in users) {
    console.log("the user email is " + users[user].email)
    if(users[user].email === checkMail) {
      return true; 
    }  
  }
  return false;
};

//Function to find appropriate ID given an email address
const idFinder = function(users, checkMail) {
  for(user in users) {
    if(users[user].email === checkMail) {
      return user; 
    }
  }
  //If that email address hasn't been put in the database before, return an error:
  return "noSuchEmail";
}

//Function for sorting the URLs so logged in users only see their data:
const urlsForUser = function(id) {
  console.log("this is the id", id)
  //Setup empty object to export:
  let userURLs = {};
  //Loop through the entries in the urlDatabase:
  for(thisURL in urlDatabase) {
    console.log(" the url id ", id);
    console.log(" the user id", urlDatabase[thisURL].userID)
    //if the entry has the same userID as what's in the cookie
    if(id === urlDatabase[thisURL].userID) {
      console.log("do i go here")
      //true: push it to the object; false: do nothing with it.
      userURLs[thisURL] = urlDatabase[thisURL];
    }
  }
  console.log("heeyyyy", userURLs)
  return userURLs;
};


//In case someone requests the basic page, they'll land here with a "hello"
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  if(req.session.user_id) { 
    res.redirect("/urls")
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    }
    res.render("login", templateVars);
  }
})


//Register page post functionality
app.post("/register", (req, res) => {
  //get all of the info that has been passed to the server:
  const email = req.body.email;
  const password = req.body.password;
  //check to see if user exists
  if(email === '') {
    res.status(400).send(`Sorry, we're gonna need some info first.`)
  } else {
    //If emailChecker finds a match, throw the 400 error
    if(emailChecker(users, email)) {
      res.status(400).send(`We already have that email on file. Have you been here before?`)
    } else {
      //Else, the user doesn't already exist, so let's create it:
      let idString = generateRandomString();
      users[idString] = { 
        id: idString, 
        email: email,
        password: bcrypt.hashSync(password, 10)
      }
      //Create cookie for new user:
      req.session.user_id = idString;
      console.log(users);
      //redirect to the URLs page when the user data has been successfully stored
      res.redirect("/urls");
    } 
 }
});

app.get("/users", (req, res) => {
  res.render(users);
})

//Login page post funcionality
app.post("/login", (req, res) => {
  console.log("We in here, here's the email: " + req.body.email)
  let foundId = idFinder(users, req.body.email);
  if(foundId === "noSuchEmail") {
    //Email is not registered. Respond with 403
    res.status(403).send(`Sorry, we don't have that email on file.`)
    //Email address was found, idFinder has returned the user's id tag
  } else {
    console.log(`I'ma checkin' this foundId.password value ${users[foundId].password}`)
    if(bcrypt.compareSync(req.body.password, users[foundId].password) === false) {
      //Wrong password, try again.
      res.status(403).send(`Sorry, that password didn't match.`)
    } else {
      //Right password, let's log you in:
      req.session.user_id = foundId;
      res.redirect("/urls");
    }
  }
})

//Setting up the delete function for URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session.user_id) {
    console.log("You ARE logged in.");
      let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL, 
      userID: users[req.session.user_id], 
    };
    delete urlDatabase[req.params.shortURL]; //Delete the desired data
    console.log("A URL has been deleted."); //Server side message when a URL has been deleted
    res.redirect("/urls");  //reload the page (now without the deleted URL upon completion)
  } else {
    res.redirect("/login");  
  }
});

//Edit the longURL but keep the shortURL the same
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; //Params came as part of the URL, body came as part of the submission
  res.redirect("/urls");
});

//Logout functionality with cookie deletion:
app.post("/logout", (req, res) => {
  req.session = null; //Delete the cookie
  console.log("A Cookie has been deleted."); //Server side message when someone logs out/a cookie has been deleted
  res.redirect("/urls");  //reload URLs page (now without the logged in user)
});


//When requested, render the register page.
app.get("/register", (req, res) => {
  if(req.session.user_id) { 
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    }
    res.render("register", templateVars);
  }
});

//When requested, return a stringified JSON readout of our URL database 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//When requested, push a new shortURL/URL pair to the database and redirect to the page showing the URLs.
app.post("/urls", (req, res) => {
  let shorty = generateRandomString(); //Saving the random string to shorty variable
  let newEntry = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    urlDatabase[shorty] = newEntry; //Creating a database pair at the value of shorty : (original submission URL)
    console.log(urlDatabase);
  res.redirect(`/urls/${shorty}`);        //Redirect the user to the URL we just created
});

//When reqeusted, render the urls_new page as outlined in the .ejs file of the same name.
app.get("/urls/new", (req, res) => {
  console.log(`The userID, random string is ${req.session.user_id}`);
  if(req.session.user_id !== undefined) {
    let templateVars = {
      user: users[req.session.user_id],
    }
  res.render("urls_new", templateVars);
    
  } else {
    res.redirect("/login")
  }
});

//When requested, show the URLs on a page
app.get("/urls", (req, res) => {
  //Check to see if the user is logged in:
  console.log(`The userID, random string is ${req.session.user_id}`);
  
  if(req.session.user_id !== undefined) {
    let urls = urlsForUser(req.session.user_id)
    console.log("Is urlsforuser returning here?" + urls.shortURL);
    //Since they're logged in, they can see content, BUT
    //It should be THEIR content:

    let templateVars = {
      user: users[req.session.user_id],
      urls: urls
    }
    res.render("urls_index", templateVars); 
  } else {
  //They're not logged in, so they get redirected to login:
  res.status(400).send(`Welcome! Have you logged in yet? Visit: http://localhost:8080/login`)
  }
});

//Because this URL produces itself procedurally, it can't be above others whose precedence it might take:
app.get("/urls/:shortURL", (req, res) => {
  if(req.session.user_id) {
    console.log("You ARE logged in.");
      let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL, 
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");  
  }
});

//This is located at the bottom for similar reasons as the urls/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
