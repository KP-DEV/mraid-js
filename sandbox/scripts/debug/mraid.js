(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mraid = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
var CLOSE_IMAGE, CloseIndicator, EventEmitter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter = require('events').EventEmitter;

CLOSE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABiElEQVRYR8WX7VHDMAyG304AG5QNaCegTMIIrMII3QS6AWzQEcoG3NuLco5jWR/OHf7ZNH4e27Kk7PDPY6fwzwCeAbwCuA06HgB8Ari25msJEP42Qb8HJQT+qM1XC5RwWXhWooY35ysFWvCshAZfzScCHwDejbP27oQFF8wXj1cEGCB7R7BZEl44UT8ADiLAF2n0MCARhZ94w8oYGJGIwH+58ulaor4FGYmn6Z7LVettIuFcOY/yPlp5ICpBgRRcE+DvEQlH2GC18t4OyLOtJFR4bwe2kujCPQIjx2HCvQIZCRc8KsCS6ol2zmtlzDlwtX6gjOxIkinfc0lYAlm4u4r2BEbhLglNYCu4KaGlYm/AMdo50lW0VYwicBYWjnQpr8txFC5VLZK2F7ejbEiy8EzaniWiLZmV4aI7cRQBnuGLUVcteHQnLmxORIAplhL8GmoNL9wrwYZ01RNqElG4JTHDW8WolsjCNYkFXKuGIsFeb9FAGjGiPZbA5LfHfdvLP1rFKMn0v/YH3SyKIXgTEY0AAAAASUVORK5CYII=';


/*
 * Close indicator widget
 * @extends EventEmitter
 * @namespace widgets
 */

CloseIndicator = (function(superClass) {
  extend(CloseIndicator, superClass);

  function CloseIndicator() {
    this._viewable = false;
    this._elem = document.createElement('div');
    this._elem.setAttribute('style', 'border-bottom-left-radius: 5px; width: 50px; height: 50px; position: absolute; top: 0; right: 0; z-index: 2147483647; display: none; box-shadow: 0 0 4px 0 rgba(0, 0, 0, .5);');
    this._elem.style.background = "rgba(255, 255, 255, .5) url(" + CLOSE_IMAGE + ") 50% 50% no-repeat";
    this._elem.addEventListener('click', (function(_this) {
      return function(e) {
        return _this.emit('click', e);
      };
    })(this));
  }


  /*
   * Append to target DOM Node
   * @param {Element} target DOM Node to append indicator to
   */

  CloseIndicator.prototype.appendTo = function(target) {
    this.parent = target;
    return target.appendChild(this._elem);
  };


  /*
   * Show indicator
   * @return {Boolean} indicator visibility
   */

  CloseIndicator.prototype.show = function() {
    this._elem.style.display = 'block';
    return this._viewable = true;
  };


  /*
   * Hide indicator
   * @return {Boolean} indicator visibility
   */

  CloseIndicator.prototype.hide = function() {
    this._elem.style.display = 'none';
    return this._viewable = false;
  };

  return CloseIndicator;

})(EventEmitter);

module.exports = CloseIndicator;


},{"events":1}],3:[function(require,module,exports){
var CloseIndicator, EventEmitter, MRAID, MRAID_VER, PLACEMENTS, STATES, SUPPORTS,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

EventEmitter = require('events').EventEmitter;

CloseIndicator = require('./close-indicator.coffee');

MRAID_VER = '2.0';

SUPPORTS = {
  sms: false,
  tel: false,
  calendar: false,
  storePicture: false,
  inlineVideo: true,
  vpaid: true
};

STATES = ['loading', 'default', 'expanded', 'resized', 'hidden'];

PLACEMENTS = ['inline', 'interstitial'];

MRAID = (function() {
  function MRAID() {}

  MRAID._state = 'loading';

  MRAID._placementType = 'interstitial';

  MRAID._viewable = false;

  MRAID._maxSize = {
    width: 0,
    height: 0
  };

  MRAID._defaultPosition = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  MRAID._currentPosition = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  MRAID._resizeProperties = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    customClosePosition: 'top-right',
    allowOffscreen: true
  };

  MRAID._expandProperties = {
    width: 0,
    height: 0,
    useCustomClose: false,
    isModal: true
  };

  MRAID._orientationProperties = {
    allowOrientationChange: true,
    forceOrientation: 'landscape'
  };

  MRAID._emitter = new EventEmitter;

  MRAID.getVersion = function() {
    return MRAID_VER;
  };

  MRAID.addEventListener = function(event, listener) {
    if (event == null) {
      this._emitError('No event name to listen for provided', 'addEventListener');
      return;
    }
    if (listener == null) {
      this._emitError('No listener for event provided', 'addEventListener');
      return;
    }
    return this._emitter.addListener(event, listener);
  };

  MRAID.removeEventListener = function(event, listener) {
    if (event == null) {
      this._emitError('No event name to unsubscribe from provided', 'removeEventListener');
      return;
    }
    if (listener) {
      return this._emitter.removeListener(event, listener);
    } else {
      return this._emitter.removeAllListeners(event);
    }
  };

  MRAID.getState = function() {
    return this._state;
  };

  MRAID._setState = function(state) {
    if (indexOf.call(STATES, state) >= 0 && state !== this._state) {
      this._state = state;
      return this._emitter.emit('stateChange', state);
    }
  };

  MRAID.getPlacementType = function() {
    return this._placementType;
  };

  MRAID._setPlacementType = function(placement) {
    if (indexOf.call(PLACEMENTS, placement) >= 0) {
      return this._placementType = placement;
    }
  };

  MRAID.isViewable = function() {
    return this._viewable;
  };

  MRAID._setViewable = function(viewable) {
    viewable = !!viewable;
    if (viewable !== this._viewable) {
      this._viewable = viewable;
      return this._emitter.emit('viewableChange', viewable);
    }
  };

  MRAID.open = function(URL) {
    if (URL == null) {
      URL = '';
    }
    if (typeof URL === 'string' && URL) {
      return this._sendMessage('open', URL, (function(_this) {
        return function() {
          return _this._emitter.emit('viewableChange', false);
        };
      })(this));
    } else {
      return this._emitError('No or invalid URL passed in', 'open');
    }
  };

  MRAID.expand = function(URL) {
    if (this._state === 'expanded') {
      return;
    }
    if (URL) {
      return this._emitError('Not implemented. Connect with the developer of this piece of shit and say it to him', 'expand');
    } else {
      return this._sendMessage('state', 'expanded', (function(_this) {
        return function() {
          _this._setCurrentPosition({
            x: 0,
            y: 0,
            width: _this._expandProperties.width,
            height: _this._expandProperties.height
          });
          return _this._setState('expanded');
        };
      })(this));
    }
  };

  MRAID.getExpandProperties = function() {
    return this._expandProperties;
  };

  MRAID.setExpandProperties = function(properties) {
    var height, useCustomClose, width;
    if (this._state !== 'expanded') {
      width = properties.width, height = properties.height, useCustomClose = properties.useCustomClose;
      if (width != null) {
        this._expandProperties.width = width;
      }
      if (height != null) {
        this._expandProperties.height = height;
      }
      if (useCustomClose != null) {
        return this._expandProperties.useCustomClose = useCustomClose;
      }
    }
  };

  MRAID.getOrientationProperties = function() {
    return this._orientationProperties;
  };

  MRAID.setOrientationProperties = function(properties) {
    var allowOrientationChange, forceOrientation;
    allowOrientationChange = properties.allowOrientationChange, forceOrientation = properties.forceOrientation;
    if (allowOrientationChange != null) {
      this._orientationProperties.allowOrientationChange = allowOrientationChange;
    }
    if (forceOrientation != null) {
      return this._orientationProperties.forceOrientation = forceOrientation;
    }
  };

  MRAID.close = function() {
    switch (this._state) {
      case 'expanded':
      case 'resized':
        return this._sendMessage('state', 'default', (function(_this) {
          return function() {
            return _this._setState('default');
          };
        })(this));
      case 'default':
        if (this._placementType === 'interstitial') {
          return this._sendMessage('state', 'hidden', (function(_this) {
            return function() {
              return _this._setState('hidden');
            };
          })(this));
        }
        break;
      default:
        return this._emitError('Error occurred while trying to close container', 'close');
    }
  };

  MRAID.useCustomClose = function(use) {
    if (use != null) {
      this._expandProperties.useCustomClose = use;
    }
    if (use && (this._closeIndicator != null)) {
      return this._closeIndicator.hide();
    }
  };

  MRAID.resize = function() {
    return this._emitError('Not implemented. Connect with the developer of this piece of shit and say it to him', 'resize');
  };

  MRAID.getResizeProperties = function() {
    return this._resizeProperties;
  };

  MRAID.setResizeProperties = function(properties) {
    var allowOffscreen, customClosePosition, height, offsetX, offsetY, width;
    width = properties.width, height = properties.height, offsetX = properties.offsetX, offsetY = properties.offsetY, customClosePosition = properties.customClosePosition, allowOffscreen = properties.allowOffscreen;
    if (width != null) {
      this._resizeProperties.width = width;
    }
    if (height != null) {
      this._resizeProperties.height = height;
    }
    if (offsetX != null) {
      this._resizeProperties.offsetX = offsetX;
    }
    if (offsetY != null) {
      this._resizeProperties.offsetY = offsetY;
    }
    if (customClosePosition != null) {
      this._resizeProperties.customClosePosition = customClosePosition;
    }
    if (allowOffscreen != null) {
      return this._resizeProperties.allowOffscreen = allowOffscreen;
    }
  };

  MRAID.getCurrentPosition = function() {
    return this._currentPosition;
  };

  MRAID._setCurrentPosition = function(position) {
    var height, width, x, y;
    x = position.x, y = position.y, width = position.width, height = position.height;
    if (x != null) {
      this._currentPosition.x = x;
    }
    if (y != null) {
      this._currentPosition.y = y;
    }
    if (width != null) {
      this._currentPosition.width = width;
    }
    if (height != null) {
      this._currentPosition.height = height;
    }
    if ((width != null) || (height != null)) {
      return this._emitter.emit('sizeChange', this._currentPosition.width, this._currentPosition.height);
    }
  };

  MRAID.getMaxSize = function() {
    return this._maxSize;
  };

  MRAID._setMaxSize = function(size) {
    var height, width;
    width = size.width, height = size.height;
    if (width != null) {
      this._maxSize.width = width;
    }
    if (height != null) {
      return this._maxSize.height = height;
    }
  };

  MRAID.getDefaultPosition = function() {
    return this._defaultPosition;
  };

  MRAID._setDefaultPosition = function(position) {
    var height, width, x, y;
    x = position.x, y = position.y, width = position.width, height = position.height;
    if (x != null) {
      this._defaultPosition.x = x;
    }
    if (y != null) {
      this._defaultPosition.y = y;
    }
    if (width != null) {
      this._defaultPosition.width = width;
    }
    if (height != null) {
      return this._defaultPosition.height = height;
    }
  };

  MRAID.getScreenSize = function() {
    var size;
    return size = {
      width: window.screen.width,
      height: window.screen.height
    };
  };

  MRAID.supports = function(feature) {
    if (feature in SUPPORTS) {
      return SUPPORTS[feature];
    } else {
      return false;
    }
  };

  MRAID.createCalendarEvent = function(params) {
    return this._emitError('Not supported by SDK', 'createCalendarEvent');
  };

  MRAID.playVideo = function(URI) {
    return this._emitError('Not supported by SDK', 'playVideo');
  };

  MRAID.storePicture = function(URI) {
    return this._emitError('Not supported by SDK', 'storePicture');
  };

  MRAID.initVpaid = function(vpaidCreative) {
    var callback, callbacks, event, onAdClickThru, onAdDurationChange, onAdError, onAdImpression, onAdInteraction, onAdLog, onAdPaused, onAdPlaying, onAdUserAcceptInvitation, onAdUserClose, onAdUserMinimize, onAdVideoComplete, onAdVideoFirstQuartile, onAdVideoMidpoint, onAdVideoStart, onAdVideoThirdQuartile, onStartAd;
    if (!this._checkVPAIDInterface(vpaidCreative)) {
      console.log('vpaid check failed', vpaidCreative);
      this._emitError('Incorrect VPAID Creative Interface. VPAID will not be initialized', 'initVpaid');
      return;
    }
    onAdImpression = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adImpression'
        });
      };
    })(this);
    onStartAd = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'startAd'
        });
      };
    })(this);
    onAdVideoStart = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adVideoStart'
        });
      };
    })(this);
    onAdVideoFirstQuartile = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adVideoFirstQuartile'
        });
      };
    })(this);
    onAdVideoMidpoint = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adVideoMidpoint'
        });
      };
    })(this);
    onAdVideoThirdQuartile = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adVideoThirdQuartile'
        });
      };
    })(this);
    onAdVideoComplete = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adVideoComplete'
        });
      };
    })(this);
    onAdClickThru = (function(_this) {
      return function(url, id, playerHandles) {
        return _this._sendMessage('vpaidEvent', {
          name: 'adClickThru',
          params: {
            url: url,
            id: id,
            playerHandles: playerHandles
          }
        });
      };
    })(this);
    onAdInteraction = (function(_this) {
      return function(id) {
        return _this._sendMessage('vpaidEvent', {
          name: 'adInteraction',
          params: id
        });
      };
    })(this);
    onAdDurationChange = (function(_this) {
      return function() {
        var duration, remaining;
        duration = vpaidCreative.getAdDuration();
        remaining = vpaidCreative.getAdRemainingTime();
        return _this._sendMessage('vpaidEvent', {
          name: 'adDurationChange',
          params: {
            duration: duration,
            remaining: remaining
          }
        });
      };
    })(this);
    onAdUserAcceptInvitation = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adUserAcceptInvitation'
        });
      };
    })(this);
    onAdUserMinimize = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adUserMinimize'
        });
      };
    })(this);
    onAdUserClose = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adUserClose'
        });
      };
    })(this);
    onAdPaused = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adPaused'
        });
      };
    })(this);
    onAdPlaying = (function(_this) {
      return function() {
        return _this._sendMessage('vpaidEvent', {
          name: 'adPlaying'
        });
      };
    })(this);
    onAdError = (function(_this) {
      return function(message) {
        return _this._sendMessage('vpaidEvent', {
          name: 'adError',
          params: message
        });
      };
    })(this);
    onAdLog = (function(_this) {
      return function(id) {
        return _this._sendMessage('vpaidEvent', {
          name: 'adLog',
          params: id
        });
      };
    })(this);
    callbacks = {
      AdImpression: onAdImpression,
      AdStarted: onStartAd,
      AdVideoStart: onAdVideoStart,
      AdVideoFirstQuartile: onAdVideoFirstQuartile,
      AdVideoMidpoint: onAdVideoMidpoint,
      AdVideoThirdQuartile: onAdVideoThirdQuartile,
      AdVideoComplete: onAdVideoComplete,
      AdClickThru: onAdClickThru,
      AdInteraction: onAdInteraction,
      AdDurationChange: onAdDurationChange,
      AdUserAcceptInvitation: onAdUserAcceptInvitation,
      AdUserMinimize: onAdUserMinimize,
      AdUserClose: onAdUserClose,
      AdPaused: onAdPaused,
      AdPlaying: onAdPlaying,
      AdError: onAdError,
      AdLog: onAdLog
    };
    for (event in callbacks) {
      callback = callbacks[event];
      vpaidCreative.subscribe(callback, event);
    }
    return vpaidCreative.startAd();
  };

  MRAID._checkVPAIDInterface = function(vpaidCreative) {
    if (vpaidCreative.subscribe && vpaidCreative.unsubscribe && vpaidCreative.getAdDuration && vpaidCreative.getAdRemainingTime && vpaidCreative.startAd) {
      return true;
    }
    return false;
  };

  MRAID._emitError = function(message, action) {
    if (action == null) {
      action = null;
    }
    return this._emitter.emit('error', message, action);
  };

  (function() {
    var timeout;
    MRAID._sendMessage = window.mraid._sendMessage;
    MRAID._setPlacementType(window.mraid.placementType);
    MRAID._setDefaultPosition(window.mraid.defaultPosition);
    MRAID._setCurrentPosition(window.mraid.defaultPosition);
    MRAID._setMaxSize(window.mraid.maxSize);
    MRAID.setExpandProperties(window.mraid.maxSize);
    if (window.mraid._MRAIDReadyListener) {
      MRAID.addEventListener('ready', window.mraid._MRAIDReadyListener);
    }
    MRAID._closeIndicator = new CloseIndicator;
    MRAID._closeIndicator.on('click', function() {
      return MRAID.close();
    });
    timeout = function(delay, func) {
      return setTimeout(func, delay);
    };
    timeout(1000, (function(_this) {
      return function() {
        MRAID._closeIndicator.appendTo(window.document.body);
        if (!MRAID._expandProperties.useCustomClose) {
          return MRAID._closeIndicator.show();
        }
      };
    })(this));
    document.addEventListener('click', function(e) {
      var body, html, target;
      html = document.documentElement;
      body = document.body;
      target = e.target;
      while (target !== body && target !== html) {
        if (target.nodeName.toLowerCase() === 'a') {
          e.preventDefault();
          return;
        }
        target = target.parentNode;
      }
    });
    window.mraid = MRAID;
    window.mraid._setState('default');
    return window.mraid._emitter.emit('ready');
  })();

  return MRAID;

})();

module.exports = MRAID;


},{"./close-indicator.coffee":2,"events":1}]},{},[3])(3)
});
//# sourceMappingURL=mraid.js.map
