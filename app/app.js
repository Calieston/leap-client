'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var log4js = require('log4js');

// log4js stuff
log4js.configure({
    appenders: [
        {   type: 'console',
        },
        {   type: 'file',
            filename: "logs/leapclient.log",
            category: 'leapclient',
            maxLogSize: 20480,
            backups: 10
        }
    ]
});
log4js.getLogger("leapclient").setLevel("DEBUG");

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(express.static(__dirname + '../bower_components'));
app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// App.use(express.static(path.join(__dirname, 'bower_components')));

// Routes
var leap = require('./routes/index');
//var backend = require('./routes/index');

// External:
app.use('/', leap);


// Development error handler
// Will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// Production error handler
// No stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});


module.exports = app;