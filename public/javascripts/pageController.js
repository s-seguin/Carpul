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
    socket.emit('getMyRidesFromServer');
    $('a').removeClass('active');
    $('#myRidesNav').addClass('active');
    $('#mainViewer').html(myRides);
}

function renderMyAccount(){
    $('a').removeClass('active');
    $('#myAccountNav').addClass('active');
    $('#mainViewer').html(myAccount);
}

let myAccount =
    '<div id="myAccount">\n' +
    '    <div>\n' +
    '        <h4>My Account</h4>\n' +
    '        <div>\n' +
    '            Account Details\n' +
    '\n' +
    '        </div>\n' +
    '        <div class="container-fluid">\n' +
    '            <div class="col-sm-8" id="user-page-details">\n' +
    '                <!-- This is where we could insert their account information  -->\n' +
    '                <span class="account-info" id="user-page-email"> Email: <input class="account-info-box" type="text" name="account-info-email" value="'+ email + '" disabled></span>\n' +
    '                <span class="account-info" id="user-page-fname"> First Name: <input class="account-info-box" type="text" name="account-info-fname" value="'+ name +'"disabled></span>\n' +
    '                <span class="account-info" id="user-page-lname"> Last Name: <input class="account-info-box" type="text" name="account-info-lname" value="'+ lname +'"disabled></span>\n' +
    '                <span class="account-info" id="user-page-phone"> Phone Number: <input class="account-info-box" type="tel" name="account-info-phone" value="'+ phone +'"disabled></span>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '\n' +
    '        <div class="col-sm-4" id="user-page-pic">\n' +
    '            <img id="accountPic" src="images/passenger.png">\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>';

let myRides = '<div>My Rides</div>';

let mainPage =
    '<h1>Destination: University of Calgary</h1>' +
    '<div class="row" id="exploreRow"> </div>';
