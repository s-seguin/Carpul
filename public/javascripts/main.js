var socket = io();
socket.on('connect', function(){
  console.log(name + ' is connected and has Socket id ' + socket.id);
  socket.emit('register', {name: name, user_id: user_id});
});

$(function()  {
  console.log('init. Getting maps from server');
  //Had to move this to the top, or else the notification would get lost during map rendering
  socket.on('notification', function(data){
    console.log((typeof data), data, (typeof user_id), user_id);
    if(data.toString() === user_id){
      console.log("One of your rides has received an update");
      $("#NotificationOn").css("display", "");
      $("#NotificationOff").css("display", "none");
    }
  });

  socket.on('sendMapsToClient', function(maps){
    i=0;
    try {
      for (let index in maps) {
        var column =
          '<div class="col-sm-4">' +
            '<div class="col-sm-12 well">' +
              '<iframe frameborder="0" style="border:0" src="loading.gif" allowfullscreen></iframe>' +
              '<div class="ride-body" type="button" data-ride_id="' + maps[index].ride_id +
              '" data-toggle="modal" data-target="#rideDetailModal">' +
                '<h4>Driver: ' + maps[index].fname+ '</h4>' +
                '<h5>Departure: ' + formatDate(maps[index].ride_date) + '</h5>' +
                '<p id="r_id" value=' + maps[index] + ' hidden></p>' +
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

  socket.on('fillDetailCardInfo', function(rideEntry) {
    let start = document.getElementById('rdm-origin');
    start.innerHTML = rideEntry.start_location;

    let destination = document.getElementById('rdm-destination');
    destination.innerHTML = rideEntry.end_location;

    let date = document.getElementById('rdm-date');
    date.innerHTML = formatDate(rideEntry.ride_date);

    let available = document.getElementById('rdm-available');
    available.innerHTML = rideEntry.available;

    let price = document.getElementById('rdm-price');
    price.innerHTML = rideEntry.price_per_seat;

    let map = document.getElementById('detailMap');
    $(map).attr('src', rideEntry.embedded_map);

  });

  ///Todo: refresh table when ride is accepted or declined
    //todo: fix bug with only rides with requests showing up
  socket.on('sendMyRidesToClient', function(maps){
    $('#myRidesTable').html("");
    $('#myRidesTable').html('<thead>'+
    '<tr>'+
      '<th scope="col">Ride Time</th>'+
      '<th scope="col">From</th>'+
      '<th scope="col">To</th>'+
      '<th scope="col">Cost</th>'+
      '<th scope="col">Seats available</th>'+
      '<th scope="col">Passenger Requests</th>'+
      '<th scope="col">Delete Ride</th>'+
    '</tr>'+
  '</thead>');
    console.log("received " + maps.length + " ride the user has been apart of from server");
    try{
        let dupID = [];
      for(let index in maps){
          console.log(maps);
          if (!dupID.includes(maps[index].ride_id)) {
              //get all requests for this ride
              let requests = maps.filter(e => e.ride_id === maps[index].ride_id);
              dupID.push(maps[index].ride_id);
              //console.log(JSON.stringify(requests));
              let passengerTable =
                  "<table>" +
                  "<thead>" +
                  "<tr>" +
                  "<th>email</th>" +
                  "<th>status</th>" +
                  "</tr>" +
                  "</thead>" +
                  "<tbody>";
              let noPassenger= false;

              for (let r in requests) {
                  if (requests[r].email != null) {
                      passengerTable += "<tr>";
                      passengerTable += "<td>" + requests[r].email+ "</td>";
                      if (requests[r].accepted == null) {
                          passengerTable += "<td><div class='btn-group text-nowrap'><button onclick='acceptRequest("+requests[r].request_id+")'>accept</button>";
                          passengerTable += "<button onclick='declineRequest("+requests[r].request_id+")'>decline</button></div></td>";
                      } else {
                          if (requests[r].accepted == true)
                              passengerTable += "<td>accepted</td>";
                          else
                              passengerTable += "<td>declined</td>";

                      }
                  } else {
                      noPassenger = true;
                  }
              }
              if (noPassenger)
                  passengerTable = "No requests";
              else
                passengerTable += "</tbody></table>";

              var ridesTable = document.getElementById("myRidesTable");
              var newRow = ridesTable.insertRow(1);
              var dateCell = newRow.insertCell(0);
              var startLocCell = newRow.insertCell(1);
              var endLocCell = newRow.insertCell(2);
              var priceCell = newRow.insertCell(3);
              var seatsCell = newRow.insertCell(4)
              var passengerCell = newRow.insertCell(5);
              var deleteCell = newRow.insertCell(6);

              dateCell.innerHTML = formatDate(maps[index].ride_date);
              startLocCell.innerHTML = maps[index].start_location;
              endLocCell.innerHTML = maps[index].end_location;
              priceCell.innerHTML = maps[index].price_per_seat;
              seatsCell.innerHTML = maps[index].available;
              passengerCell.innerHTML = passengerTable;
              deleteCell.innerHTML = '<a class="Delete_Ride" href=#delete  type="button" data-toggle="modal" data-target="#Delete_RideModal" data-ride_id="' + maps[index].ride_id + '"><button type="button" class="btn btn-danger">Delete</button></a>';

          }

      }
    } catch (e){
      console.log(e);
    } finally {
      console.log("Done getting my rides from server");
    }
  });
  $(document).on("click", ".Delete_Ride", function(){
    let upForDeletion = $(this).data("ride_id");
    console.log('Delete ride? ' + $(this).data("ride_id"));
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
          '<iframe frameborder="0" style="border:0" src="' + rideObj.embedded_map +
          '" allowfullscreen></iframe>' +
          '<div class="ride-body" type="button" data-ride_id="' + rideObj.ride_id +
          '" data-toggle="modal" data-target="#rideDetailModal">' +
            '<h4>Driver: ' + name + '</h4>' +
            '<h5>Departure: ' + formatDate(rideObj.ride_date) + '</h5>' +
          '</div>' +
        '</div>' +
      '</div>'
    $('#exploreRow').prepend($(column));
  });

  $(document).on("click", ".ride-body", function() {
    $('#rideDetailModal').data("ride_id", $(this).data("ride_id"));

    socket.emit('getInfoForCard', $(this).data("ride_id"));
  });
});

let map = null;
let originPlaceId = "";
let destinationPlaceId = "";
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
function formatDate(unformattedDate){
  let dateReceived = new Date(unformattedDate).toString();
  return dateReceived.slice(0, dateReceived.indexOf("GMT"));
}


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

function notificationClicked(){
  $("#NotificationOff").css("display", "");
  $("#NotificationOn").css("display", "none");
  renderMyRides();
  socket.emit("clearNotification", user_id)
}

function checkFieldValidation() {
  let originInput = document.getElementById("origin-input").value;
  let destinationInput = document.getElementById("destination-input").value;
  let dateInput = document.getElementById("dateInput").value;
  let timeInput = document.getElementById("timeInput").value;
  let capacity = document.getElementById("capInput").value;
  let priceInput = document.getElementById("priceInput").value;
  capacity = parseInt(capacity, 10);
  priceInput = parseFloat(priceInput, 10).toFixed(2);

  if ((originInput === "") || (destinationInput === "")) {
    window.alert("Please ensure the ride's origin and destination fields have been set.");
    return false;
  }

  else if (dateInput === "" || timeInput === "") {
    window.alert("Please ensure the ride's date and time have been set.");
    return false;
  }

  else if (capacity % 1 != 0 || capacity === 0) {
    window.alert("Please ensure the vehicle's capacity has been set to a number between 1 and 9.");
    return false;
  }
  else if (priceInput < 0) {
    window.alert("Please ensure the price per seat value is a whole or decimal number equal to or greater than 0.");
    return false;
  }
  //expire is a useless field
  //embeddedMap done server side
  //directions_obj is useless
  let rideDate = dateInput + ' ' + timeInput + ':00';
  let formData = {user_id: user_id, start_location: originInput, end_location: destinationInput,
            capacity: capacity, available: capacity, originPlaceId: originPlaceId, destinationPlaceId : destinationPlaceId,
           ride_date: rideDate, ride_time: timeInput, created_on: Date.now(), price_per_seat: priceInput};

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
        if(maps[index].end_location.toLowerCase().includes(searchValue.toLowerCase())){
          searchMaps.push(maps[index]);
          var column =
            '<div class="col-sm-4">' +
              '<div class="col-sm-12 well">' +
                '<iframe frameborder="0" style="border:0" src="loading.gif" allowfullscreen></iframe>' +
                '<div class="ride-body" type="button" data-ride_id="' + maps[index].ride_id +
                '" data-toggle="modal" data-target="#rideDetailModal">' +
                  '<h4>Driver: ' + maps[index].fname+ '</h4>' +
                  '<h5>Departure: ' + formatDate(maps[index].ride_date) + '</h5>' +
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
      if (searchMaps.length == 0) {
        $('#exploreRow').append('<h4 style="padding-left:15px">No Rides found for this destination</h4>');
      }else {
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
      } //End else
    } catch (e) {
      console.log(e);
    } finally {
      console.log("Done drawing maps");
    }
  });
}
