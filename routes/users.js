var express = require('express');
var router = express.Router();
var passport = require('passport');
var dbConn = require('../config/database');
var pg = require('pg');
//var conString = "postgres://admin:admin@localhost:5432/carpul";



/* GET users listing. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.send("Users Page.... it looks like you've been logged in succesfully " + JSON.stringify(req.user));


});

////TESTING --> this
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}

module.exports = function (passport){
  return router;
};
