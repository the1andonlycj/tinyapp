# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). It supports encrypted cookies and hashed user IDs. Overall, it's a good first effort at programming an app from the beginning. Enjoy.

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Be aware that your choice of port (to be specified in the express_server.js file) will affect which local host port the app listens on. Currently, calling http://localhost/8080/register will provide you with the easiest starting point for the html site. 

## Final Product
!["Screenshot of URL creation page"](https://raw.githubusercontent.com/the1andonlycj/tinyapp/master/docs/CreateTinyURLPage.png)

!["Screenshot of login page"](https://raw.githubusercontent.com/the1andonlycj/tinyapp/master/docs/LoginPage.png)

!["Screenshot of URLs page"](https://raw.githubusercontent.com/the1andonlycj/tinyapp/master/docs/UrlsPage.png)