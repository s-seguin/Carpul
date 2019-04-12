var socket = io();
socket.on('connect', function(){
  console.log(name + ' is connected and has Socket id ' + socket.id);
  socket.emit('register', {name: name, user_id: user_id});
});

$(function()  {
  console.log('init. Getting maps from server');
  socket.emit('getMapsFromServer');
  socket.on('sendMapsToClient', function(maps){
    i=0;
    try {
      console.log("received " + maps.length + " maps");
      console.log(maps);
      $('iframe').each(function(){
        console.log($(this).attr('src'));
        if (i < maps.length && $(this).attr('src') != "about:blank") { //idk wherer the hell about:blank is coming from but it's an unseeable iframe that needs to be ignored when populating
          console.log(maps[i].embedded_map);
          $(this).attr('src', maps[i].embedded_map);
          i++;
        }
      })
    } catch (e) {
      console.log(e);
    } finally {
      console.log("Done drawing maps");
    }
  });
  socket.on("sendEmbeddedMap", function (rideObj) {
    console.log("Embedded map received: " + rideObj.embeddedMapString);
    $('#testMap iframe').attr('src', rideObj.embeddedMapString);
    var expDate = new Date(rideObj.expire);
    console.log(expDate);
    $('#testMap h3').text('Driver: ' + rideObj.driver + ' 0 Stars');
    $('#testMap h3:last').text('Departure: ' + expDate.getHours() + ":" + expDate.getMinutes()
    + ' with ' + rideObj.capacity + ' seats left');
  });
});

var map = null;

function switchSelectedRole(id) {
  const imgPassenger = document.getElementById('imgPassenger');
  const imgDriver = document.getElementById('imgDriver');
  const groupSize = document.getElementById('group-size');
  const driverFormElements = document.getElementById('driver-form-elements');
  if (id === 'imgPassenger' && (groupSize.style.display === "none" || groupSize.style.display === "")) {
    groupSize.style.display = "table";
    driverFormElements.style.display = "none";
    imgPassenger.style.backgroundColor = "mediumseagreen";
    imgDriver.style.backgroundColor = "lightskyblue";
  }
  else if (id === 'imgDriver' && (driverFormElements.style.display === "none" || driverFormElements.style.display === "")) {
    driverFormElements.style.display = "table";
    groupSize.style.display = "none";
    imgPassenger.style.backgroundColor = "lightskyblue";
    imgDriver.style.backgroundColor = "mediumseagreen";
  }
}

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function initMap() {
  const mapOptions = {
    mapTypeControl: false,
    //center: {lat: -33.8688, lng: 151.2195}, instead center on calgary
    center: {lat: 51.047073, lng: -114.069243},
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  new AutocompleteDirectionsHandler(map);
}

$('#newRideModal').on('shown.bs.modal', function () {
  initMap();
});

$("#newRideModal").on("shown.bs.modal", function(e) {
  google.maps.event.trigger(map, "resize");
});

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
  var newRideModal = document.getElementById('newRideModal');
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'DRIVING';
  this.directionsService = new google.maps.DirectionsService;
  this.directionsDisplay = new google.maps.DirectionsRenderer;
  this.directionsDisplay.setMap(map);

  var rideDetails = document.getElementById('ride-details');
  var originInput = document.getElementById('origin-input');
  var destinationInput = document.getElementById('destination-input');
  var modeSelector = document.getElementById('mode-selector');

  var originAutocomplete = new google.maps.places.Autocomplete(originInput);
  // Specify just the place data fields that you need.
  originAutocomplete.setFields(['place_id']);

  var destinationAutocomplete =
          new google.maps.places.Autocomplete(destinationInput);
  // Specify just the place data fields that you need.
  destinationAutocomplete.setFields(['place_id']);

  // Commented out to force driving directions
  // this.setupClickListener('changemode-walking', 'WALKING');
  // this.setupClickListener('changemode-transit', 'TRANSIT');
  this.setupClickListener('changemode-driving', 'DRIVING');

  this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

  this.rideDetails.push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
          destinationInput);
  //this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
        id, mode) {
  var radioButton = document.getElementById(id);
  var me = this;

  radioButton.addEventListener('click', function () {
    me.travelMode = mode;
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
        autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', this.map);

  autocomplete.addListener('place_changed', function () {
    var place = autocomplete.getPlace();

    if (!place.place_id) {
      window.alert('Please select an option from the dropdown list.');
      return;
    }
    if (mode === 'ORIG') {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.route = function () {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;
  var directionsObj = {
    //The ObjectID here will allow us to make sure we can have a unique identifier to remove/edit these objects if need be
    //Only will work if we allow 1 of every route? Otherwise we will need a different system.
    //objectID: this.originPlaceId + this.destinationPlaceId,
    origin: {'placeId': this.originPlaceId},
    destination: {'placeId': this.destinationPlaceId},
    travelMode: this.travelMode
  };

  this.directionsService.route(
          directionsObj,
          function (response, status) {
            console.log(JSON.stringify(directionsObj.origin) + " " + JSON.stringify(directionsObj.destination) + " " + directionsObj.travelMode);
            //Here we want to send this object back to server in order for the server to save this route for later
            //socket.emit("sendNewMapToServer", directionsObj);

            if (status === 'OK') {
              me.directionsDisplay.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
              console.log("Waiting to click button");
              $('.ride-detail-element.search').click(function(){
                console.log("Search button clicked");
                console.log(JSON.stringify(directionsObj.origin) + " " + JSON.stringify(directionsObj.destination) + " " + directionsObj.travelMode);
                //Here we want to send this object back to server in order for the server to save this route for later
                socket.emit("sendNewMapToServer", directionsObj);
                console.log("Waiting for map from server");
              });
          })
};
