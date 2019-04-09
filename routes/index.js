var express = require('express');
var router = express.Router();
//var passport = require('passport');
//var dbConn = require('../config/database');
//var pg = require('pg');
/*var path = require('path');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000; */




//var htmlPath = path.join(__dirname);
/* GET home page. */
var savedUsername = null;

router.get('/main', isLoggedIn, function(req, res, next) {
  res.redirect('/');

});

router.get('/', isLoggedIn, function(req, res, next) {
  console.log('index.js get');
  savedUsername = req.user.fname;
  console.log('Cookie already has value: ' + req.cookies['Carpul'] + 'Setting to ' + savedUsername);
  res.cookie('Carpul', savedUsername);
  console.log("creating cookie " + savedUsername);
  //socket ID is useless to us here because it is their PREVIOUS id
  // and as soon as they go to www code they will be assigened a new socket id.
  console.log(req.cookies);
  console.log(req.user);
  res.render('../public/main.html', {title: 'Noodles.js', name: savedUsername});
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

module.exports = function(passport) {
  return router;
};
