var leapjs = require('leapjs');
var io = require('socket.io-client');
const ip = '******';
const port = '******';

// intialize leap motion controller
var leap = new leapjs.Controller({
  enableGestures: true
});
leap.on('connect', function() {
  //console.log('leap motion successfully connected.');
});
leap.on('deviceFrame', function(frame) {
  // Loop through available gestures
  for (var i = 0; i < frame.gestures.length; i++) {
    var gesture = frame.gestures[i];
    switch (gesture.type) {

      case 'swipe':
        if (gesture.state == 'stop') {
          var socket = io.connect(ip+':'+port, {
            reconnect: true
          });
          // add a connect listener
          socket.on('connect', function(socket) {
            console.log('Connected!');
          });
          // send start recording command to smart mirror
          socket.emit('smartmirror', 'recording');

        }
        break;
    }
  }
});