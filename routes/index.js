var express = require('express');
var router = express.Router();
/*var path = require('path');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000; */




//var htmlPath = path.join(__dirname);
/* GET home page. */
var userCount = 0;
var savedUsername = null;
router.get('/', function(req, res, next) {
  console.log('index.js get');
  if(req.cookies['Carpul']){
    savedUsername = req.cookies['Carpul'];
    console.log('Cookie already exists. Value: ' + req.cookies['Carpul']);
  }
  else{
    savedUsername = "USER"+userCount;
    userCount = userCount+1;
    res.cookie('Carpul', savedUsername);
    console.log("creating cookie " + savedUsername);
  }
  //socket ID is useless to us here because it is their PREVIOUS id
  // and as soon as they go to www code they will be assigened a new socket id.
  console.log(req.cookies); 
  res.render('../public/index.html', {title: 'Noodles.js', name: savedUsername});
});
/*
app.get('/', function(req, res){
  app.use(express.static(htmlPath));
  res.sendFile('D:\\GitHub\\Carpul\\public\\index.html');
});


io.on('connection', function(socket){

  socket.on('getMapObject', function(directionsObj){
    console.log(JSON.stringify(directionsObj.origin) + " " + JSON.stringify(directionsObj.destination) + " " + directionsObj.travelMode);
    var fs = require('fs');
    fs.appendFile("SavedRoutes.JSON", JSON.stringify(directionsObj)+"\n", function(err) {
    if (err) {
        console.log(err);
    }
});
  });
});
*/
module.exports = router;
/*
http.listen(port, function(){
  console.log('listening on *:' + port);
});
*/
