var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

//console.log('Server Started');

module.exports = app;
