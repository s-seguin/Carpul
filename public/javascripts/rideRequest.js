function requestRide() {
    console.log("Request ride");
    let ride_id =  $('#rideDetailModal').data("ride_id");
    $.post('api/request/new', { ride_id: ride_id},
        function(returnedData){
            console.log(returnedData);
            if (returnedData === 'OK') {
              console.log("requested " + ride_id);
                socket.emit('newRideRequest', ride_id);
                alert('Your request was submitted');
            }
            else
                alert('Sorry we could not submit you request');
    });


}
