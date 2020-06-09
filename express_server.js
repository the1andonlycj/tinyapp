//Declaring all of our dependencies:
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//String generator to create unique shortURLs
function generateRandomString() {
  var randomString = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return (randomString);
};

const urlDatabase = {
  // Key/value pairs for shortURL : longURL
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//In case someone requests the basic page, they'll land here with a "hello"
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Setting up the delete function for URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; //Delete the desired data
  console.log("A URL has been deleted."); //Server side message when a URL has been deleted
  res.redirect("/urls");  //reload the page (now without the deleted URL upon completion)
});

//Edit
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL; //Params came as part of the URL, body came as part of the submission
  res.redirect("/urls");
});


//When requested, return a stringified JSON readout of our URL database 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello", templateVars);
});

//When requested, push a new shortURL/URL pair to the database and redirect to the page showing the URLs.
app.post("/urls", (req, res) => {
  let shorty = generateRandomString(); //Saving the random string to shorty variable
  urlDatabase[shorty] = req.body.longURL; //Creating a database pair at the value of shorty : (original submission URL)
  res.redirect(`/urls/${shorty}`);        //Redirect the user to the URL we just created
});


//When reqeusted, render the urls_new page as outlind in the .ejs file of the same name.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//When reqeusted, show the URLs on a page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Because this URL produces itself procedurally, it can't be above others whose precedence it might take:
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  console.log(urlDatabase[req.params.shortURL]);
  res.render("urls_show", templateVars);
});

//This is located at the bottom for similar reasons as the urls/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});