function requestRide() {
    console.log("Request ride");
    let ride_id =  $('#rideDetailModal').data("ride_id");
    $.post('api/request/new', { ride_id: ride_id},
        function(returnedData){
            console.log(returnedData);
    });
}