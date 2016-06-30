var leapjs = require('leapjs');
var io = require('socket.io-client');
const ip = '******';
const port = '******';
var socket = io.connect(ip + ':' + port, {
  reconnect: true
});
// add a connect listener
socket.on('connect', function(socket) {
  console.log('Connected successfully to smartmirror');
});
// intialize leap motion controller
var leap = new leapjs.Controller({
  enableGestures: true
});
leap.on('error', function() {
  console.log('error');
})
leap.on('deviceFrame', function(frame) {
  // Loop through available gestures
  for (var i = 0; i < frame.gestures.length; i++) {
    var gesture = frame.gestures[i];
    switch (gesture.type) {
      case 'circle':
        if (gesture.state == 'stop') {
          socket.emit('smartmirror', 'recording-tap');
        }
        break;
      case 'swipe':
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
        //Classify as right-left or up-down
        if (isHorizontal) {
          if (gesture.direction[0] > 0) {
            if (gesture.state == 'stop') {
              swipeDirection = "right";
              // send start recording command to smart mirror
              socket.emit('smartmirror', 'swipe' + swipeDirection);
            }
          } else {
            if (gesture.state == 'stop') {
              swipeDirection = "left";
              // send start recording command to smart mirror
              socket.emit('smartmirror', 'swipe' + swipeDirection);
            }
          }
        } else {
          //vertical
          if (gesture.direction[1] > 0) {
            if (gesture.state == 'stop') {
              swipeDirection = "up";
              socket.emit('smartmirror', 'swipe' + swipeDirection);
            }
          } else {
            if (gesture.state == 'stop') {
              swipeDirection = "down";
              // send start recording command to smart mirror
              socket.emit('smartmirror', 'swipe' + swipeDirection);
            }
          }
        }
        break;
    }
  }
});
leap.connect();