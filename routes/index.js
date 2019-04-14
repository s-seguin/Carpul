var express = require('express');
var router = express.Router();

var dbClient;

let notificationCenter = [];
var io;
/***
 * Insert a new ride into the Ride table
 * @param rideObj
 */
function insertIntoDB(rideObj) {
  //TODO: Remove hard coded values and use real value from users
  console.log("Insert into DB");
  dbClient.query(
      `INSERT INTO ride(user_id, start_location, end_location, capacity, available, embedded_map, ride_date, created_on, price_per_seat) VALUES ($1, $2, $3, $4, $5, $6, (TIMESTAMP '${rideObj.ride_date}'), Now(), $7);`,
      [rideObj.user_id, rideObj.start_location, rideObj.end_location, rideObj.capacity, rideObj.available, rideObj.embedded_map, rideObj.price_per_seat],
      (err, res) => {
        if (res) {
          console.log(res);
        } else {
          console.log("There was an error inserting user into database " + err);
        }
      }
  );
}
function sendMyRidesToClient(socket){
  let mapObjs = null;
  dbClient.query(
    // "SELECT * FROM ride LEFT OUTER JOIN request ON (ride.ride_id = request.ride_id) LEFT OUTER JOIN account ON (account.user_id = request.user_id) WHERE ride.user_id=$1",[socket.user_id],
    "SELECT ride.ride_id, ride.user_id, ride.ride_date, ride.start_location, ride.end_location, ride.price_per_seat, ride.available, request.request_id, request.accepted, account.email FROM ride LEFT OUTER JOIN request ON (ride.ride_id = request.ride_id) LEFT OUTER JOIN account ON (account.user_id = request.user_id) WHERE ride.user_id=$1", [socket.user_id],
    (err, res) => {
      if (res) {
        console.log("num rows from getMyRides query " + res.rows.length);
        mapObjs = [];
        res.rows.forEach((item) => {
          mapObjs.push(item);
        });
        console.log("Sending " + mapObjs.length + " maps");
        socket.emit('sendMyRidesToClient', mapObjs);
      } else {
        console.log("there was an error: " + err);
        console.log(mapObjs);
        socket.emit('sendMapsToClient', mapObjs);
      }
    }
  );
}

function sendMyPassengerRidesToClient(socket){
  let passengerObjs = null;
  dbClient.query(
    "SELECT * FROM request JOIN account ON (account.user_id = request.user_id) JOIN ride ON (request.ride_id = ride.ride_id) WHERE request.user_id=$1",[socket.user_id],
    (err, res) => {
      if (res) {
        console.log("num rows from getMyPassengerRides query " + res.rows.length);
        passengerObjs = [];
        res.rows.forEach((item) => {
          passengerObjs.push(item);
        });
        console.log("Sending " + passengerObjs.length + " maps");
        socket.emit('sendMyPassengerRidesToClient', passengerObjs);
      } else {
        console.log("there was an error: " + err);
        console.log(passengerObjs);
        // socket.emit('sendMapsToClient', passengerObjs);
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

module.exports = function(passport, server, db) {
  dbClient = db;
  var savedUsername = null;
  io = require('socket.io')(server);

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


  io.on('connection', function(socket){
    console.log("New Connection from " + socket.id);
    var readline = require('readline');
    var fs = require('fs');

    socket.on('newRideRequest', (x) => {
      console.log("New ride request ride_id", x);
      dbClient.query(
        'SELECT user_id FROM ride WHERE ride_id=$1',[x],
        (err, res) => {
          if (res) {
            console.log(res.rows.length + " Rows received");
            res.rows.forEach((item) => {
              console.log("Ride request to " + item.user_id);
              if (!notificationCenter.includes(item.user_id.toString())) {
                console.log("User " + item.user_id + " is not in the notification center, Adding them");
                notificationCenter.push(item.user_id.toString());
              }
              io.emit('notification', item.user_id);
            })
          } else {
            console.log("there was an error: " + err);
          }
        }
      );
    });
    socket.on("requestAccepted", function(data){
      console.log("Accepting Request " + data);
      requestUpdate(data);

    });
    socket.on("requestDeclined", function(data){
      console.log("Declining Request " + data);
      requestUpdate(data);
    })

    socket.on('sendNewMapToServer', function(rideFormData){
      //TODO: get user id from session and store in rideObj

      let rideObj = rideFormData;
      rideObj.embedded_map = "https://www.google.com/maps/embed/v1/directions?origin=place_id:"+rideFormData.originPlaceId+"&destination=place_id:"+rideFormData.destinationPlaceId+"&key=AIzaSyCj9Fanni2mPxM4cp3y1DAL1FqOfhY3M0M"

      //Send this map right back to the client
      insertIntoDB(rideObj);

      dbClient.query(
          'SELECT r.ride_id FROM ride r INNER JOIN (' +
              'SELECT MAX(created_on) created_on FROM ride' +
          ') c ON r.created_on=c.created_on ' +
          'WHERE r.embedded_map=$1', [rideObj.embedded_map],
          (err, res) => {
            if (res) {
              res.rows.forEach((item) => {
                rideObj.ride_id = item.ride_id;
                console.log("sending: " + JSON.stringify(rideObj));
                io.emit('sendEmbeddedMap', rideObj);
              });
            } else {
              console.log("There was an error grabbing ride_id for latest post: " + err);
            }
          }
      );
    });

    socket.on('getMapsFromServer', function(){
      let mapObjs = null;
      // console.log("Querying the database and make a list of non expired Maps");
      dbClient.query(
        "SELECT r.*, a.fname FROM ride r INNER JOIN account a ON r.user_id=a.user_id WHERE r.ride_date >= Now() AND r.available > 0 ORDER BY r.ride_date",
        (err, res) => {
          if (res) {
            //console.log("num rows from query " + res.rows.length);
            mapObjs = [];
            res.rows.forEach((item) => {
              mapObjs.push(item);
            });
           // console.log("Sending " + mapObjs.length + " maps");
            socket.emit('sendMapsToClient', mapObjs);
          } else {
            console.log("there was an error: " + err);
            // console.log(mapObjs);
            socket.emit('sendMapsToClient', mapObjs);
          }
        }
      );
      //Turns each link into an element of an array
      console.log("Waiting for DB response");
    });

    //populate detail card for ride
    socket.on('getInfoForCard', function(rideId) {
      console.log(rideId);
      dbClient.query(
        "SELECT r.* FROM ride r WHERE r.ride_id=$1", [rideId],
        (err, res) => {
          if (res) {
            socket.emit('fillDetailCardInfo', res.rows[0]);

          } else {
            console.log("there was an error: " + err);
          }
        }
      );
    })

    // search function
      socket.on('getMapsFromServerSearch', function(searchValue){
        let mapObjs = null;
        let timeOfQuery = new Date();
        console.log("Querying the database and make a list of non expired Maps");
        dbClient.query(
          "SELECT r.*, a.fname FROM ride r INNER JOIN account a ON r.user_id=a.user_id WHERE r.ride_date >= $1 and r.available > 0",[timeOfQuery],
          (err, res) => {
            if (res) {
              console.log("num rows from query " + res.rows.length);
              mapObjs = [];
              res.rows.forEach((item) => {
                mapObjs.push(item);
              });
              console.log("Sending " + mapObjs.length + " maps");
              socket.emit('sendMapsToClientSearch', mapObjs);
            } else {
              console.log("there was an error: " + err);
              console.log(mapObjs);
              socket.emit('sendMapsToClientSearch', mapObjs);
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
      if (notificationCenter.includes(socket.user_id.toString())) {
        console.log("user " + socket.user_id + " has an unread notifiaction");
        socket.emit('notification', socket.user_id);
      } else {
        console.log(socket.user_id + " is not in " + notificationCenter);
      }
    });
    socket.on('getMyRidesFromServer', function(){
      sendMyRidesToClient(socket);
    });
    socket.on('getMyPassengerRidesFromServer', function(){
      sendMyPassengerRidesToClient(socket);
    });
    socket.on("deleteRide", function(data){
      console.log("request to delete ride " + data);
      let rideToDelete = data;
      dbClient.query(
        "SELECT request.user_id FROM ride JOIN request ON (request.ride_id = ride.ride_id) AND (ride.ride_id =$1) JOIN account ON (account.user_id = request.user_id)", [data],
        (err, res) => {
          if(res){
            console.log(res);
            res.rows.forEach((item) => {
              console.log("delete note to " + item.user_id);
              if (!notificationCenter.includes(item.user_id.toString())) {
                console.log("User " + item.user_id + " is not in the notification center, Adding them");
                notificationCenter.push(item.user_id.toString());
              }
              io.emit('notification', item.user_id);
            }
          );
          dbClient.query(
            "DELETE FROM ride WHERE ride_id=$1",[rideToDelete],
            (err, res) => {
              if (res) {
                console.log("Deleted: \n" + JSON.stringify(res));
                sendMyRidesToClient(socket);
              } else {
                console.log("there was an error: " + err);
              }
            }
          );
        }else{
          console.log(err);
        }
        }
      );
    });
    socket.on("clearNotification", function(data){ //data expected si user_id
      data = data.toString();
      let toRemove = notificationCenter.indexOf(data);
      if (toRemove != -1) {
        console.log("removing " + notificationCenter[toRemove] + " at index " + toRemove);
        notificationCenter.splice(toRemove, 1);
      } else {
        console.log(data + " is not in " + notificationCenter);
      }

    })
    //Function definitions that need io var
    function requestUpdate(x){
      console.log("Request updated for request_id", x, (typeof x));
      dbClient.query(
        'SELECT user_id FROM request WHERE request_id=$1',[x],
        (err, res) => {
          if (res) {
            res.rows.forEach((item) => {
              console.log("Update to " + item.user_id);
              if (!notificationCenter.includes(item.user_id.toString())) {
                console.log("User " + item.user_id + " is not in the notification center, Adding them");
                notificationCenter.push(item.user_id.toString());
              }
              io.emit('notification', item.user_id);
            })
          } else {
            console.log("there was an error: " + err);
          }
        }
      );
    }
  });

  return router;
};
