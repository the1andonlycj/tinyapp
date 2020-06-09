
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  var randomString = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
     randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return (randomString);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Setting up the delete function for URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("Ths is happening apparently."); //This console.log is not triggering, which means the event isn't happening at all right now.
  delete urlDatabase[req.params.shortURL]; //change console.log to delete once this thing works
  res.redirect("/urls");  //reload the page (now without the deleted URL upon completion)
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello", templateVars);
});


app.post("/urls", (req, res) => {
  let shorty = generateRandomString(); //Saving the random string to shorty variable
  urlDatabase[shorty] = req.body.longURL; //Creating a database pair at the value of shorty : (original submission URL)
  res.redirect(`/urls/${shorty}`);        //Redirect the user to the URL we just created
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  console.log("HERE'S YOUR SHORT URL" + req.params);
  
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  console.log(urlDatabase[req.params.shortURL]);
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});