'use strict';

var leapjs = require('leapjs');
var log4js = require('log4js');
var leap;
var bool = true;
var socketCtrl = require('./socket');
var logger = log4js.getLogger("leapclient");
const gestureAction = 'gesture';
const recordAction= 'record';
const screenTap = 'screenTap';

// avoid multiple gesture detection with timeout
function timeout() {
  logger.debug('call timeout function');
  bool = false;
  setTimeout(function() {
    bool = true;
  }, 1000);
}
exports.initialize = (params) => {
  var widgets = params.gestureWidgets;
  var newList = [];
  var widgetList = [];
  widgets.forEach(function(item) {
    var widget = {};
    widget.name = item.module.name;
    widget.gesture = item.gesture.gestureType;
    widgetList.push(widget);
  });
  validateAndProcessGesture(widgetList, 'swipe left', gestureAction);
  // intialize leap motion controller
  var leap = new leapjs.Controller({
    enableGestures: true
  });

  leap.on('error', function() {
    logger.error('error');
  })

  leap.connect();
  leap.on('deviceFrame', function(frame) {

    // Loop through available gestures
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i];
      switch (gesture.type) {
        case screenTap:
          // gesture for play module
          if (gesture.state == 'stop') {
            validateAndProcessGesture(widgetList, screenTap, gestureAction);
          }
          break;
        case 'circle':
          // gesture for play module
          if (gesture.state == 'stop') {
              var isClockwise = (gesture.normal[2] <= 0);
              if (isClockwise) {
                logger.info('circle clockwise');
                validateAndProcessGesture(widgetList, 'circle clock', recordAction);
              } else {
                logger.info('circle unclock');
                //validateAndProcessGesture(widgetList, 'circle clock', 'record');
              }
          }
          break;
      }
    }
  });
}
// check if recognized gesture is available in user widgets gesture
function validateAndProcessGesture(list, gestureType, action) {
  if (bool == true) {
    switch(action) {
      case 'gesture':
        list.forEach(function(item){
          if(item.gesture == gestureType){
            logger.debug('Found gesture match: '+gestureType);
            let params = {};
            params.widget = item.name,
            params.gesture = item.gesture,
            params.action = action
            socketCtrl.sendMessage(params);
            timeout();
          }else{
            logger.debug('gesture '+gestureType + ' not found in user widget '+ item.name);
          }
        });
      break;
      case 'record':
            let params = {};
            params.action = action
            socketCtrl.sendMessage(params);
            timeout();
      break;
    }
  }
}

/*leap.on('deviceFrame', function(frame) {
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
                msg: 'record'
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
              // SWIPE DOWN
              swipeDirection = "down";
              if (bool == true) {
                console.log("down");
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
});*/
exports.leap = leap;