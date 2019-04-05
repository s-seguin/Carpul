var express = require('express');
var router = express.Router();
var passport = require('passport');
var dbConn = require('../config/database');
var pg = require('pg');
//var conString = "postgres://admin:admin@localhost:5432/carpul";

const client = new pg.Client(dbConn.conn);
const queryStr = 'SELECT * from account;';



/* GET users listing. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.send("Users Page.... it looks like you've been logged in succesfully");


});

function query() {
  client.connect();
  client.query(query, (err, res) => {
    if (!err) {
      res.rows.forEach((item) => console.log(item));
    } else {
      console.log(err.stack);
    }
    client.end()
  })
}

async function query2() {
  console.log("query2");
  await client.connect();
  var res = await client.query(queryStr);
  res.rows.forEach(row=>{
    console.log(row);
  });
  await client.end();

  return res;
}

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
