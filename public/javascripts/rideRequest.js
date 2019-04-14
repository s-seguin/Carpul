function requestRide() {
    console.log("Request ride");
    let ride_id =  $('#rideDetailModal').data("ride_id");
    $.post('api/request/new', { ride_id: ride_id},
        function(returnedData){
            if (returnedData === 'OK') {
                socket.emit('getMyRidesFromServer');
                console.log("requested " + ride_id);
                socket.emit('newRideRequest', ride_id);
                alert('Your request was submitted');
            }
            else if (returnedData === "alreadyRequested") {
              alert('Error: You have already requested a seat for this ride.');
            }
            else if (returnedData === "sameId") {
              alert('Error: You cannot request a seat on your own ride.');
            }
            else
                alert('Sorry, we could not submit your request.');
    });


}


function acceptRequest(request_id){
    console.log("Request ID: " + request_id);
    $.post('api/request/accept', { request_id: request_id},
        function(returnedData){
            //console.log(returnedData);
            if (returnedData === 'OK') {
                socket.emit('getMyRidesFromServer');
                socket.emit('getMyPassengerRidesFromServer');
                socket.emit('requestAccepted', request_id);
                alert('You accepted request no ' + request_id);
            } else  if (returnedData  === 'Ride full') {
                alert('Sorry that ride is already full');
            }
            else
                alert('Sorry we could not submit you request');
        });
}

function declineRequest(request_id){
    $.post('api/request/decline', { request_id: request_id},
        function(returnedData){
           //console.log(returnedData);
            if (returnedData === 'OK') {
                socket.emit('getMyRidesFromServer');
                socket.emit('getMyPassengerRidesFromServer');
                socket.emit('requestDeclined', request_id);
                alert('You declined request no ' + request_id);
            }
            else
                alert('Sorry we could not submit you request');
        });
}
