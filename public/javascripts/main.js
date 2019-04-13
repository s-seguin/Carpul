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
  socket.on('sendMyRidesToClient', function(maps){
    $('#myRidesList').html("");
    i=0;
    console.log("received " + maps.length + " ride the user has been apart of from server");
    try{
      for(let index in maps){
        let pastRide = '<li> ' + maps[index].ride_date + '<br>' +
        'From: ' + maps[index].start_location + "<br>" +
        'To: ' + maps[index].end_location + '<br>' + " Cost: " + maps[index].price_per_seat +
        '</li>' + '<a class="Delete_Ride" href=#delete  type="button" data-toggle="modal" ' +
        'data-target="#Delete_RideModal" data-ride-id="' + maps[index].ride_id + '">Delete Ride</a>';
        $('#myRidesList').append($(pastRide));
      }
    } catch (e){
      console.log(e);
    } finally {
      console.log("Done getting my rides from server");
    }
  });
  $(document).on("click", ".Delete_Ride", function(){
    let upForDeletion = $(this).data("ride-id");
    console.log('Delete ride? ' + $(this).data("ride-id"));
    $("#Delete_RideModal").data("ride_id", upForDeletion);
  });
  $("#Delete_Ride_Yes").click(function(){
    let upForDeletion = $("#Delete_RideModal").data("ride_id");
    console.log("Yes Clicked for ride " + upForDeletion);
    socket.emit("deleteRide", upForDeletion);
    $("#Delete_RideModal").data("ride_id", -1);
    upForDeletion = $("#Delete_RideModal").data("ride_id");
  });
  $("#Delete_Ride_No").click(function(){
    let upForDeletion = $("#Delete_RideModal").data("ride_id");
    console.log("No Clicked for ride " + upForDeletion);
    $("#Delete_RideModal").data("ride_id", -1);
    upForDeletion = $("#Delete_RideModal").data("ride_id");
    console.log('Val set to ' + upForDeletion);
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
  let formData = {user_id: user_id, start_location: originInput, end_location: destinationInput,
            capacity: capacity, available: capacity, originPlaceId: originPlaceId, destinationPlaceId : destinationPlaceId,
           ride_date: rideDate, ride_time: timeInput, created_on: "", price_per_seat: priceInput};

  $('#newRideModal').modal('toggle');
  document.getElementById("origin-input").value = '';
  document.getElementById("destination-input").value = '';
  document.getElementById("dateInput").value = '';
  document.getElementById("timeInput").value = '';
  document.getElementById("capInput").value = '';
  document.getElementById("priceInput").value = '';

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

function searchRender(searchValue){
  console.log("Search: " + searchValue);
  socket.emit('getMapsFromServerSearch');
  socket.on('sendMapsToClientSearch', function(maps){
    i=0;
    var searchMaps = [];
    try {
      $('#exploreRow').html("");
      for (let index in maps) {
        console.log(maps[index].end_location +" ---- "+searchValue);
        if(maps[index].end_location.includes(searchValue)){
          searchMaps.push(maps[index]);
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
          console.log("found ride");
        }
        else{
          console.log("pass on ride");
        }
      }
      console.log("received " + searchMaps.length + " maps");
      console.log(searchMaps);
      $('iframe').each(function(){
        console.log($(this).attr('src'));
        if (i < searchMaps.length && $(this).attr('src') != "about:blank") { //idk wherer the hell about:blank is coming from but it's an unseeable iframe that needs to be ignored when populating
          console.log(searchMaps[i].embedded_map);
          $(this).attr('src', searchMaps[i].embedded_map);
          console.log("Im drawing a map");
          i++;
        }
      })
    } catch (e) {
      console.log(e);
    } finally {
      console.log("Done drawing maps");
    }
  });
}
