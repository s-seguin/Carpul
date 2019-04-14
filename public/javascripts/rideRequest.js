function requestRide() {
    console.log("Request ride");
    let ride_id =  $('#rideDetailModal').data("ride_id");
    $.post('api/request/new', { ride_id: ride_id},
        function(returnedData){
           // console.log(returnedData);
            if (returnedData === 'OK') {
                socket.emit('getMyRidesFromServer');
                socket.emit('newRideRequest');
                alert('Your request was submitted');
            }
            else
                alert('Sorry we could not submit you request');
    });


}


function acceptRequest(request_id){
    console.log("Request ID: " + request_id);
    $.post('api/request/accept', { request_id: request_id},
        function(returnedData){
            //console.log(returnedData);
            if (returnedData === 'OK') {
                socket.emit('getMyRidesFromServer');
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
                socket.emit('requestDeclined', request_id);
                alert('You declined request no ' + request_id);
            }
            else
                alert('Sorry we could not submit you request');
        });
}