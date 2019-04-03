var express = require('express');
var router = express.Router();
/*var path = require('path');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000; */




//var htmlPath = path.join(__dirname);
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('index.js get');
  console.log(req.cookies)
  res.render('../public/index.html', {title: 'Noodles.js' });
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
