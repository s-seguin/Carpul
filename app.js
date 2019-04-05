var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');

var app = express();

var pg = require('pg');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');

var pgDbConn = require('./config/database.js');
//require('./config/passport')(passport);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');


//Passport config stuff
app.use(session({
    secret: 'somerandomsecrethash',
    resave: true,
    saveUninitialized: true,
    cookie:{
        expires: false
    }
})); //Set default values
app.use(passport.initialize());
app.use(passport.session()); //Login sessions
app.use(flash()); //For 'Flashing' messages back to client

///ROUTES
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.use(express.static(path.join(__dirname, 'public')));


//console.log('Server Started');

module.exports = app;
