'use strict';

var leapjs = require('leapjs');
var log4js = require('log4js');
var leap;
var socketCtrl = require('./socket');

// Flag variable to set timeout
var bool = true;
var logger = log4js.getLogger('leapclient');

// Gesture constants
const gestureAction = 'gesture';
const recordAction = 'record';
const screenTap = 'screenTap';
const keyTap = 'keyTap';

// Avoid multiple gesture detection with timeout
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
      if (item.gesture != null) {
        var widget = {};
        widget.name = item.module.name;
        widget.gesture = item.gesture.gestureType;
        widgetList.push(widget);
      }
    });
    // Intialize leap motion controller

    var leap = new leapjs.Controller({
      enableGestures: true,
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
            // Gesture for play module
            if (gesture.state == 'stop') {
              validateAndProcessGesture(widgetList, screenTap, gestureAction);
            }
            break;
          case keyTap:
            // Gesture for play module
            if (gesture.state == 'stop') {
              validateAndProcessGesture(widgetList, keyTap, recordAction);
            }
            break;
          case 'circle':
            // Gesture for play module
            if (gesture.state == 'stop') {
              var isClockwise = (gesture.normal[2] <= 0);
              if (isClockwise) {
                logger.info('circle clockwise');
                validateAndProcessGesture(widgetList, 'circle clock', gestureAction);
              } else {
                logger.info('circle unclock');
                validateAndProcessGesture(widgetList, 'circle clock', gestureAction);
              }
            }
            break;
          case 'swipe':
            // Classify swipe as either horizontal or vertical
            var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
            if (isHorizontal) {
              if (gesture.direction[0] > 0) {
                // SWIPE RIGHT
                if (gesture.state == 'stop') {
                  validateAndProcessGesture(widgetList, 'swipe right', gestureAction);
                }
              } else {
                // SWIPE LEFT
                if (gesture.state == 'stop') {
                  validateAndProcessGesture(widgetList, 'swipe left', gestureAction);
                }
              }
            } else {
              // Vertical
              if (gesture.direction[1] > 0) {
                // SWIPE UP
                if (gesture.state == 'stop') {
                  validateAndProcessGesture(widgetList, 'swipe up', gestureAction);
                }
              } else {
                // SWIPE DOWN
                if (gesture.state == 'stop') {
                  validateAndProcessGesture(widgetList, 'swipe down', gestureAction);
                }
              }
            }
            break;
        }
      }
    });
  }

// Validate gesture and send socket message
function validateAndProcessGesture(list, gestureType, action) {
  if (bool == true) {
    switch (action) {
      case 'gesture':
        // Iterate over all gesture widgets
        list.forEach(function(item) {
          if (item.gesture == gestureType) {
            logger.debug('Found gesture match: ' + gestureType);
            let params = {};
            params.widget = item.name,
            params.gesture = item.gesture,
            params.action = action
            socketCtrl.sendMessage(params);
            timeout();
          } else {
            logger.debug('gesture ' + gestureType + ' not found in user widget ' + item.name);
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

exports.leap = leap;