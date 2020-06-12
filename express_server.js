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




//In case someone requests the basic page, they'll land here with a "hello"
app.get("/", (req, res) => {
  res.redirect("/urls");
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
    if(helpers.emailChecker(users, email)) {
      res.status(400).send(`We already have that email on file. Have you been here before?`)
    } else {
      //Else, the user doesn't already exist, so let's create it:
      let idString = helpers.generateRandomString();
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
  let shorty = helpers.generateRandomString(); //Saving the random string to shorty variable
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
    let urls = helpers.urlsForUser(req.session.user_id, urlDatabase)
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
  console.log(`TinyUrl App Listening on Port ${PORT}!`);
});
