//Declaring all of our dependencies:
const helpers = require("./helpers.js")
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); //Checks if there's a cookie, then adds it to the cookie object
app.use(cookieSession({
  name: 'session',
  keys: ["ilovebitsygirl"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//<===================DATABASES============================================>
//Repository for URLs:
const urlDatabase = {
};
//Repository for our user data:
const users = {
};




//<===================POSTING FUNCIONALITY==================================>
//Register page post functionality
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if(email === '') {
    res.status(400).send(`Sorry, we're gonna need some info first.`)
  } else {
    if(helpers.emailChecker(users, email)) {
      res.status(400).send(`We already have that email on file. Have you been here before?`)
    } else {
      let idString = helpers.generateRandomString();
      users[idString] = { 
        id: idString, 
        email: email,
        password: bcrypt.hashSync(password, 10)
      }
      req.session.user_id = idString;
      console.log(users);
      res.redirect("/urls");
    }
  }
});

//Login page post funcionality:
app.post("/login", (req, res) => {
  console.log("We in here, here's the email: " + req.body.email)
  let foundId = helpers.idFinder(users, req.body.email);
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

//Delete function for URLs:
app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session.user_id) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      userID: users[req.session.user_id],
    };
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");  
  }
});

//Edit longURL, but keep the shortURL unchanged:
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//Post new shortURL/URL pair to the database and redirect /urls:
app.post("/urls", (req, res) => {
  let shorty = helpers.generateRandomString(); //Saving the random string to shorty variable
  let newEntry = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  urlDatabase[shorty] = newEntry;
  res.redirect(`/urls/${shorty}`);
});

//Logout functionality with cookie deletion:
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//<===================GET/SHOW PAGE FUNCTIONALITY==========================>
//In case someone requests the basic page, redirect to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//If user is logged in, redirect to urls, otherwise, show /login:
app.get("/login", (req, res) => {
  if(req.session.user_id) { 
    res.redirect("/urls")
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    }
    res.render("login", templateVars);
  }
});

//Render the register page.
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

//Return a stringified JSON readout of our URL database 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//Render the /urls_new page:
app.get("/urls/new", (req, res) => {
  if(req.session.user_id !== undefined) {
    let templateVars = {
      user: users[req.session.user_id],
    }
    res.render("urls_new", templateVars);
    
  } else {
    res.redirect("/login")
  }
});

//Show the URLs if user is logged in, otherwise redirect:
app.get("/urls", (req, res) => {
  if(req.session.user_id !== undefined) {
    let urls = helpers.urlsForUser(req.session.user_id, urlDatabase)
    let templateVars = {
      user: users[req.session.user_id],
      urls: urls
    }
    res.render("urls_index", templateVars); 
  } else {
    res.status(400).send(`Welcome! Have you logged in yet? Visit: http://localhost:8080/login`)
  }
});

//Procedurally create pages for shortURLs if user is logged in:
app.get("/urls/:shortURL", (req, res) => {
  if(req.session.user_id) {
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

//Procedurally create pages for shortURLs, but these are public:
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Console Log the port we're listening on:
app.listen(PORT, () => {
  console.log(`TinyUrl App Listening on Port ${PORT}!`);
});
