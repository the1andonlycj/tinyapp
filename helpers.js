//String generator to create unique shortURLs:
function generateRandomString() {
  var randomString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for ( var i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return (randomString);
};

//Function to check existing user emails against proposed new user email:
const emailChecker = function(users, checkMail) {
  for(user in users) {
    if(users[user].email === checkMail) {
      return true;
    }
  }
  return false;
};

//Function to find matching ID given an email address
const idFinder = function(users, checkMail) {
  for(user in users) {
    if(users[user].email === checkMail) {
      return user; 
    }
  }
  return "noSuchEmail";
};

//Function for sorting the URLs so logged in users only see their data:
const urlsForUser = function(id, urlDatabase) {
  //Setup empty object to export:
  let userURLs = {};
  //Loop through the entries in the urlDatabase:
  for(thisURL in urlDatabase) {
    //if the entry has the same userID as what's in the cookie
    if(id === urlDatabase[thisURL].userID) {
      //true: push it to the object; false: do nothing with it.
      userURLs[thisURL] = urlDatabase[thisURL];
    }
  }
  return userURLs;
};

module.exports = { urlsForUser, 
  generateRandomString,
  emailChecker,
  idFinder
}