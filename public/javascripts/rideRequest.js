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
