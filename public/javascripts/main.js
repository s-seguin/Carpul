var socket = io();
socket.on('connect', function(){
  console.log(name + ' is connected and has Socket id ' + socket.id);
  socket.emit('register', {name: name, user_id: user_id});
});

$(function()  {
  console.log('init. Getting maps from server');

  socket.on('sendMapsToClient', function(maps){
    i=0;
    try {
      for (let index in maps) {
        var column =
          '<div class="col-sm-4">' +
            '<div class="col-sm-12 well">' +
              '<iframe frameborder="0" style="border:0" src="loading.gif" allowfullscreen></iframe>' +
              '<div class="ride-body">' +
                '<h4>Driver: ' + maps[index].fname+ '</h4>' +
                '<h5>Departure: ' + maps[index].ride_date + '</h5>' +
              '</div>' +
            '</div>' +
          '</div>'
        $('#exploreRow').append($(column));
      }
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
    var column =
      '<div class="col-sm-4">' +
        '<div class="col-sm-12 well">' +
          '<iframe frameborder="0" style="border:0" src="' + rideObj.embeddedMapString +
          '" allowfullscreen></iframe>' +
          '<div class="ride-body">' +
            '<h4>Driver: ' + name + '</h4>' +
            '<h5>Departure: ' + rideObj.ride_date + '</h5>' +
          '</div>' +
        '</div>' +
      '</div>'
    $('#exploreRow').prepend($(column));
  });
});

let map = null;
let originPlaceId = "";
let destinationPlaceId = "";
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

function postRide() {
  let returnValues = checkFieldValidation();
  if (!returnValues.validInputs) {
    return;
  }
  //Here we want to send this object back to server in order for the server to save this route for later
  socket.emit("sendNewMapToServer", returnValues.formData);
}

function checkFieldValidation() {
  let originInput = document.getElementById("origin-input").value;
  let destinationInput = document.getElementById("destination-input").value;
  let dateInput = document.getElementById("dateInput").value;
  let timeInput = document.getElementById("timeInput").value;
  let capacity = document.getElementById("capInput").value;
  let priceInput = document.getElementById("priceInput").value;

  if ((originInput === "") || (destinationInput === "")) {
    window.alert("Please ensure the ride's origin and destination fields have been set.");
    return false;
  }

  else if (dateInput === "" || timeInput === "") {
    window.alert("Please ensure the ride's date and time have been set.");
    return false;
  }

  else if ((typeof capacity === 'number') && (capacity % 1 === 0)) {
    window.alert("Please ensure the vehicle's capacity has been set to a number.");
    return false;
  }
  else if (typeof priceInput === 'number') {
    window.alert("Please ensure the price per seat value is a whole or decimal number.");
    return false;
  }
  //expire is a useless field
  //embeddedMap done server side
  //directions_obj is useless
  let rideDate = dateInput + ' ' + timeInput + ':00';
  let formData = {user_id: user_id, start_location: originInput, end_location: destinationInput, expire: "",
                capacity: capacity, available: capacity, originPlaceId: originPlaceId, destinationPlaceId : destinationPlaceId,
                 directions_obj: "", ride_date: rideDate, ride_time: timeInput, created_on: "", price_per_seat: priceInput}
  return {validInputs: true, formData: formData};
}

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

  originPlaceId = this.originPlaceId;
  destinationPlaceId = this.destinationPlaceId;

  this.directionsService.route(
          directionsObj,
          function (response, status) {
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
