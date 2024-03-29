$(document).ready( function () {
    renderMainPage();
    //renderMyRides();
});

function renderMainPage(){
    $('a').removeClass('active');
    $('#exploreNav').addClass('active');
    $('#mainViewer').html(mainPage);
    socket.emit('getMapsFromServer');
}

function renderMyRides(){
    $('a').removeClass('active');
    $('#myRidesNav').addClass('active');
    $('#mainViewer').html(myRides);
    $('#passengerRideTable').hide();
    socket.emit('getMyRidesFromServer');
    socket.emit('getMyPassengerRidesFromServer');
}

function renderMyAccount(){
    $('a').removeClass('active');
    $('#myAccountNav').addClass('active');
    $('#mainViewer').html(myAccount);
}
function renderSearch(searchValue){
    $('a').removeClass('active');
    $('#exploreNav').addClass('active');
    $('#mainViewer').html(searchPage);
    $('#searchResultName').html('Destination: ' + searchValue);
}
let myAccount =
    '<div id="myAccount">\n' +
    '    <div>\n' +
    '        <h2>My Account</h2>\n' +
    '        <div>\n' +
    '            <h4>Account Details</h4>\n' +
    '        </div>\n' +
    '        <div class="border" id="account-div">\n' +
    '        <div class="col-sm-4" id="user-page-pic">\n' +
    '            <img id="accountPic" src="images/passenger.png">\n' +
    '        </div>\n' +
    '        <div class="container-fluid" id="userInfoDisplay">\n' +
    '            <div class="col-sm-8" id="user-page-details">\n' +
    '                <!-- This is where we could insert their account information  -->\n' +
    '                <span class="account-info" id="user-page-email"> Email: <p class="account-info-box" name="account-info-email">'+email+'</p></span>\n' +
    '                <span class="account-info" id="user-page-fname"> First Name: <p class="account-info-box" name="account-info-fname">'+ name +'</p></span>\n' +
    '                <span class="account-info" id="user-page-lname"> Last Name: <p class="account-info-box" name="account-info-lname" >'+ lname +'</p></span>\n' +
    '                <span class="account-info" id="user-page-phone"> Phone Number: <p class="account-info-box" name="account-info-phone" >'+ phone +'</p></span>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>';

let myRides = '<div class="myRidesController"><ul class="nav nav-tabs">\n' +
                '  <li id="driverToggle" class="active"><a onclick="showMyRidesTable()">I\'m the driver</a></li>\n' +
                '  <li id="passengerToggle"><a onclick="showMyPassengerTable()">I\'m the passenger</a></li>\n' +
            '</ul>' +
              '<table class="table table-responsive table-dark" id="myRidesTable">'+
              '<thead>'+
              '<tr>'+
                '<th scope="col">Ride Time</th>'+
                '<th scope="col">From</th>'+
                '<th scope="col">To</th>'+
                '<th scope="col">Cost</th>'+
                '<th scope="col">Passenger Requests</th>' +
                '<th scope="col">Delete Ride</th>'+
              '</tr>'+
            '</thead> </table>' +
            '<table class="table table-responsive table-striped" id="passengerRideTable">'+
            '<thead>'+
            '<tr>'+
              '<th scope="col">Ride Time</th>'+
              '<th scope="col">From</th>'+
              '<th scope="col">To</th>'+
              '<th scope="col">Cost</th>'+
              '<th scope="col">Status</th>'+
            '</tr>'+
          '</thead> </table></div>'

let mainPage =
    '<h1>Available Rides:</h1>' +
    '<div class="row" id="exploreRow"> </div>';

let searchPage =
    '<h1 id="searchResultName">Destination: </h1>' +
    '<div class="row" id="exploreRow"> </div>';

function showMyRidesTable() {
    $('li').removeClass('active');
    $('#driverToggle').addClass('active');
    $('#passengerRideTable').hide();
    $('#myRidesTable').show();
}

function showMyPassengerTable() {
    $('li').removeClass('active');
    $('#passengerToggle').addClass('active');
    $('#myRidesTable').hide();
    $('#passengerRideTable').show();
}
