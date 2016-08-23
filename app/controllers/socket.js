'use strict';

var log4js = require('log4js');
var io = require('socket.io-client');
var leapCtrl = require('./leap');
const ip = 'http://localhost';
const port = '3000';
var logger = log4js.getLogger("leapclient");
var socket = io.connect(ip + ':' + port, {
  reconnect: true
});
// add a connect listener
socket.on('connect', function(socket) {
  logger.info('Connected successfully to smartmirror');
  logger.debug('IP: '+ip + ' Port: '+ port);
});
socket.on('smartmirror-weather', function(data){
  logger.info('RECEIVED MESSAGE: '+ JSON.stringify(data, null, 4));
})
socket.on('gestures', function(data) {
  logger.info('received widget data from mirror');
  logger.debug('mirror data: '+ JSON.stringify(data, null, 4));
  let params = {};
  if(data.userGestureWidgets != null){
  logger.debug('Gesture widgets found. Start initialization!')
  params.gestureWidgets = data.userGestureWidgets;
  leapCtrl.initialize(params);
  }else{
    logger.debug('no gesture widgets found!');
  }
});

exports.sendMessage = (params) => {
  logger.info('Send message to smart mirror');
  logger.debug('socket message: '+ JSON.stringify(params, null, 4));
  socket.emit('leap client', params);
}

exports.io = io;