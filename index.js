var leapjs = require('leapjs');
var io = require('socket.io-client');
const ip = '***';
const port = '***';
var socket = io.connect(ip + ':' + port, {
  reconnect: true
});
var bool = true;

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
      case 'keyTap':
        // gesture for play module
        if (gesture.state == 'stop') {
          if (bool == true) {
            console.log('tap');
            socket.emit('smartmirror', 'tagesschau');
            bool = false;
            setTimeout(function() {
              bool = true;
            }, 2000);
          }
        }
        break;
      case 'swipe':
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
        //Classify as right-left or up-down
        if (isHorizontal) {
          if (gesture.direction[0] > 0) {
            if (gesture.state == 'stop') {
              if (bool == true) {
                swipeDirection = "right";
                console.log('right');
                socket.emit('smartmirror', 'record');
                bool = false;
                setTimeout(function() {
                  bool = true;
                }, 2000);
              }
            }
          } else {
            if (gesture.state == 'stop') {
              if (bool == true) {
                swipeDirection = "left";
                console.log('left');
                /*                socket.emit('smartmirror', '');
                                bool = false;
                                setTimeout(function() {
                                  bool = true;
                                }, 2000);*/
              }
            }
          }
        } else {
          //vertical
          if (gesture.direction[1] > 0) {
            // gesture for recording
            if (gesture.state == 'stop') {
              if (bool == true) {
                console.log("right");
                swipeDirection = "up";
                /*
                                socket.emit('smartmirror', '');
                                console.log('get swipe up gesture');
                                bool = false;
                                setTimeout(function() {
                                  bool = true;
                                }, 2000);*/
              }
            }
          } else {
            if (gesture.state == 'stop') {
              console.log("down");
              swipeDirection = "down";
              /*              if (bool == true) {
                              swipeDirection = "down";
                              socket.emit('smartmirror', '');
                              console.log('get swipe down gesture');
                              bool = false;
                              setTimeout(function() {
                                bool = true;
                              }, 2000);
                            }*/
            }
          }
        }
        break;
    }
  }
});
leap.connect();