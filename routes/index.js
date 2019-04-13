var express = require('express');
var router = express.Router();

//db stuff
var dbConn = require('../config/database');
var pg = require('pg');
var dbClient;

if (dbConn.ssl == "true") {
  console.log("[DB]  connecting to heroku db");
  dbClient = new pg.Client(
      {
        connectionString: dbConn.herokuConn,
        ssl: dbConn.ssl
      }
  );
} else {
  console.log("[DB]  connecting to local db");
  dbClient = new pg.Client(dbConn.localConn);
}

dbClient.connect();

/***
 * Insert a new ride into the Ride table
 * @param rideObj
 */
function insertIntoDB(rideObj) {
  //TODO: Remove hard coded values and use real value from users
  console.log("Insert into DB");
  dbClient.query(
      "INSERT INTO ride(user_id, start_location, end_location, expire, capacity, available, embedded_map, directions_obj, ride_date, created_on, price_per_seat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, Now(), Now(), $9);",
      [rideObj.user_id, rideObj.directionsObj.origin, rideObj.directionsObj.destination, rideObj.expire, rideObj.capacity, rideObj.capacity, rideObj.embeddedMapString, JSON.stringify(rideObj.directionsObj), '4'],
      (err, res) => {
        if (res) {
          console.log(res);
        } else {
          console.log("There was an error inserting user into database " + err);
        }
      }
  );
  //dbClient.close();
}

///TESTING to make sure the thing inserted
function selectAllFromRide() {
  dbClient.query(
      "select * from ride",
      (err, res) => {
        if (res) {
          res.rows.forEach((item) => console.log(item));
        } else {
          console.log("There was an error inserting user into database " + err);
        }
      }
  );
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}

module.exports = function(passport, server) {
  var savedUsername = null;

  router.get('/main', isLoggedIn, function(req, res, next) {
    res.redirect('/');
  });

  router.get('/', isLoggedIn, function(req, res, next) {
    //selectAllFromRide();
    console.log('index.js get');
    savedUsername = req.user.fname;
    console.log('Cookie already has value: ' + req.cookies['Carpul'] + 'Setting to ' + savedUsername);
    res.cookie('Carpul', savedUsername);
    console.log("creating cookie " + savedUsername);
    //socket ID is useless to us here because it is their PREVIOUS id
    // and as soon as they go to www code they will be assigened a new socket id.
    console.log(req.cookies);
    console.log(req.user);
    res.render('../public/index.ejs',  {name: savedUsername, email: req.user.email, lname: req.user.lname, phone: req.user.phone, user_id: req.user.user_id });
   // res.render('../public/main.html', {name: savedUsername, email: req.user.email, lname: req.user.lname, phone: req.user.phone, user_id: req.user.user_id });
  });

  ///We could likely delete this embeddedMapFunction function
  function embeddedMapFunction(item, index){
    //Don't process line if empty or fucked
    if (item.length > 2) {

      console.log("Print element at "+index+": " + item);
      //Turn line into object
      var obj = JSON.parse(item);
      console.log("JSON: " + JSON.stringify(obj));

      //I think this should work because the place_id are a fixed length
      //This basically works except for the first case. For some reason it is slightly longer than the other stringS??
      var origin = obj.origin.placeId;
      var destination = obj.destination.placeId;
      console.log("origin: " + origin);
      var embeddedMapString = "https://www.google.com/maps/embed/v1/directions?origin=place_id:"+origin+"&destination=place_id:"+destination+"&key=AIzaSyCj9Fanni2mPxM4cp3y1DAL1FqOfhY3M0M";

      var fs = require('fs');
      fs.appendFile("routes\\embeddedMaps.txt", embeddedMapString+"\n", function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }

  var io = require('socket.io')(server);

  io.on('connection', function(socket){
    console.log("New Connection from " + socket.id);
    var readline = require('readline');
    var fs = require('fs');

    socket.on('sendNewMapToServer', function(directionsObj){
      //TODO: get user id from session and store in rideObj
      console.log(JSON.stringify(directionsObj.origin) + " " + JSON.stringify(directionsObj.destination) + " " + directionsObj.travelMode);
      var rideObj = new Object();
      rideObj.driver = socket.username; //value got from register
      rideObj.user_id = socket.user_id //Value got from register
      var postTime = new Date();
      rideObj.expire = new Date(postTime.getTime() + (1*60*60*1000));
      console.log('Ride posted @ ' + postTime.getHours() + ':' + postTime.getMinutes() +'. Will expire @' +rideObj.expire.getHours() + ':' + rideObj.expire.getMinutes());
      rideObj.capacity = 4 ///Setting Defulat capacity value
      rideObj.embeddedMapString = "https://www.google.com/maps/embed/v1/directions?origin=place_id:"+directionsObj.origin.placeId+"&destination=place_id:"+directionsObj.destination.placeId+"&key=AIzaSyCj9Fanni2mPxM4cp3y1DAL1FqOfhY3M0M"
      rideObj.directionsObj = directionsObj; //sending theh whole thing cause why not
      //Send this map right back to the client
      //// TODO: Insert this into the database
      insertIntoDB(rideObj);

      console.log("sending: " + JSON.stringify(rideObj) );
      socket.emit('sendEmbeddedMap', rideObj);
    });
    socket.on('getMapsFromServer', function(){
      let mapObjs = null;
      let timeOfQuery = new Date();//.toISOString().slice(0, 19);//.replace('T', ' ');
      console.log("Querying the database and make a list of non expired Maps");
      console.log("timezone offset " + timeOfQuery.getTimezoneOffset());
      let testTime = "2019-04-11T19:15:44";
      console.log(testTime + "---" + timeOfQuery);
      dbClient.query(
        "select * from ride",
        (err, res) => {
          if (res) {
            console.log("num rows from query " + res.rows.length);
            mapObjs = [];
            res.rows.forEach((item) => {
              mapObjs.push(item);
            });
            console.log("Sending " + mapObjs.length + " maps");
            socket.emit('sendMapsToClient', mapObjs);
          } else {
            console.log("there was an error: " + err);
            console.log(mapObjs);
            socket.emit('sendMapsToClient', mapObjs);
          }
        }
      );
      //Turns each link into an element of an array
      console.log("Waiting for DB response");
    });
    socket.on('register', function(data){
      console.log('Register event. User_id ' + data.user_id + " is " + data.name);
      socket.username = data.name;
      socket.user_id = data.user_id;
      console.log("now stored in the socket: " + socket.user_id + " is " + socket.username );
    });
    /*---------------
    Ping temp code
    -----------------*/
    socket.on('pingTo', function(name){
      socket.broadcast.emit('pinged', name);
    });
    /*---------------
    Ping temp code End
    -----------------*/
  });

  return router;
};
