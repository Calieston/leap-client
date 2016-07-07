var leapjs = require('leapjs');
var io = require('socket.io-client');
const ip = 'http://localhost';
const port = '3000';
var socket = io.connect(ip + ':' + port, {
  reconnect: true
});

// add a connect listener
socket.on('connect', function(socket) {
  console.log('Connected successfully to smartmirror');
});

socket.on('test', function(data) {
  console.log(data);
});

var bool = true;

// avoid multiple gesture detection with timeout
function timeout() {
  bool = false;
  setTimeout(function() {
    bool = true;
  }, 2000);
}
// intialize leap motion controller
var leap = new leapjs.Controller({
  enableGestures: true
});
leap.on('error', function() {
  console.log('error');
})
leap.on('deviceFrame', function(frame) {
  if (frame.hands.length > 0) {
    var hand = frame.hands[0];
    var timeVisible = hand.timeVisible;
    if (timeVisible > 5) {
      // detect if hand is visible more than 5 seconds
      // console.log('hand visible');
    }
    var finger = hand.finger(hand.thumb);
    //console.log('FINGER'+ finger);
  }
  // Loop through available gestures
  for (var i = 0; i < frame.gestures.length; i++) {
    var gesture = frame.gestures[i];
    switch (gesture.type) {
      case 'circle':
        // gesture for play module
        if (gesture.state == 'stop') {
          if (bool == true) {
            var isClockwise = (gesture.normal[2] <= 0);
            if (isClockwise) {
              console.log('circle clockwise');
              socket.emit('smartmirror', {
                msg: ''
              });
            } else {
              console.log('circle counterclockwise');
              socket.emit('smartmirror', {
                msg: ''
              });
            }
            var circleProgress = gesture.progress;
            var completeCircles = Math.floor(circleProgress);
            if (completeCircles > 0) {
              socket.emit('smartmirror', {
                msg: ''
              });
            }
            timeout();
          }
        }
        break;
      case 'screenTap':
        // gesture for play module
        if (gesture.state == 'stop') {
          if (bool == true) {
            console.log('screen tap');
            socket.emit('smartmirror', {
              msg: ''
            });
            timeout();
          }
        }
        break;
      case 'handClosed':
        console.log('hand closed');
        break;
      case 'keyTap':
        // gesture for play module
        if (gesture.state == 'stop') {
          if (bool == true) {
            console.log('tap');
            socket.emit('smartmirror', {
              msg: 'tagesschau'
            });
            timeout();
          }
        }
        break;
      case 'swipe':
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
        //Classify as right-left or up-down
        if (isHorizontal) {
          if (gesture.direction[0] > 0) {
            // SWIPE RIGHT
            if (gesture.state == 'stop') {
              if (bool == true) {
                swipeDirection = "right";
                console.log('right');
                socket.emit('smartmirror', {
                  msg: 'record'
                });
                timeout();
              }
            }
          } else {
            // SWIPE LEFT
            if (gesture.state == 'stop') {
              if (bool == true) {
                swipeDirection = "left";
                console.log('left');
                socket.emit('smartmirror', '');
                timeout();
              }
            }
          }
        } else {
          //vertical
          if (gesture.direction[1] > 0) {
            if (gesture.state == 'stop') {
              // SWIPE UP
              if (bool == true) {
                console.log("up");
                swipeDirection = "up";
                socket.emit('smartmirror', '');
                timeout();
              }
            }
          } else {
            if (gesture.state == 'stop') {
              console.log("down");
              // SWIPE DOWN
              swipeDirection = "down";
              if (bool == true) {
                swipeDirection = "down";
                socket.emit('smartmirror', '');
                bool = false;
                setTimeout(function() {
                  bool = true;
                }, 2000);
              }
            }
          }
        }
        break;
    }
  }
});
leap.connect();