(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MRAIDSDK = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var EventEmitter, MRAIDContainer, MRAID_URL,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

EventEmitter = require('events').EventEmitter;

MRAID_URL = 'http://services.tvzavr.ru/generic/MRAID/mraid.min.js';

MRAIDContainer = (function() {
  function MRAIDContainer(id, url, params) {
    this._sendMessage = bind(this._sendMessage, this);
    this._initAdView = bind(this._initAdView, this);
    var defaultPosition, placementType;
    if ((id == null) || !id || typeof id !== 'string') {
      throw new TypeError('Incorrect MRAID container ID');
    }
    if ((url == null) || !url || typeof url !== 'string') {
      throw new TypeError('Incorrect MRAID Ad Unit URL');
    }
    defaultPosition = params.defaultPosition, placementType = params.placementType;
    this.id = id;
    this.parent = null;
    this.creativeUrl = url;
    this._emitter = new EventEmitter;
    this._state = 'loading';
    this._viewable = false;
    this._placementType = placementType;
    this._maxSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this._expandProperties = this._maxSize;
    this._defaultPosition = defaultPosition;
    this._currentPosition = defaultPosition;
    this._adView = MRAIDContainer.createAdView(id);
    this._adView.addEventListener('load', this._initAdView);
    this._setToDefaultPosition();
  }

  MRAIDContainer.createAdView = function(id) {
    var adView;
    adView = document.createElement('iframe');
    adView.setAttribute('id', id);
    adView.setAttribute('name', id);
    adView.setAttribute('scrolling', 'no');
    adView.setAttribute('style', 'border: none; background-color: #000; position: fixed; top: 0; left: 0; z-index: 2147483646; display: none;');
    return adView;
  };

  MRAIDContainer.prototype._initAdView = function(e) {
    var iDoc, iWin, xhr;
    iWin = e.target.contentWindow;
    iDoc = iWin.document;
    iWin.mraid = {
      _sendMessage: this._sendMessage,
      placementType: this._placementType,
      defaultPosition: this._defaultPosition,
      maxSize: this._maxSize,
      getVersion: function() {
        return '2.0';
      },
      getState: function() {
        return 'loading';
      },
      addEventListener: function(event, listener) {
        if (event === 'ready') {
          return iWin.mraid._MRAIDReadyListener = listener;
        }
      }
    };
    iDoc.write('<style>html, body { margin: 0; padding: 0; }</style>');
    xhr = new XMLHttpRequest();
    xhr.open('GET', this.creativeUrl, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          iDoc.write('<script src="' + MRAID_URL + '"></script>');
          return iDoc.write(xhr.response);
        }
      }
    };
    return xhr.send(null);
  };

  MRAIDContainer.prototype._sendMessage = function(message, data, callback) {
    switch (message) {
      case 'vpaidEvent':
        this._emitter.emit('vpaidEvent', data);
        break;
      case 'open':
        this.open(data);
        break;
      case 'state':
        switch (data) {
          case 'default':
            this._setToDefaultPosition();
            break;
          case 'expanded':
            this._expand();
            break;
          case 'hidden':
            this._close();
        }
    }
    if (typeof data === 'function') {
      callback = data;
    }
    if (callback && typeof callback === 'function') {
      return callback(this._currentPosition);
    }
  };

  MRAIDContainer.prototype._setCurrentPosition = function(position) {
    var height, width, x, y;
    x = position.x, y = position.y, width = position.width, height = position.height;
    this._currentPosition = {
      x: x,
      y: y,
      width: width,
      height: height
    };
    this._adView.style.top = y + "px";
    this._adView.style.left = x + "px";
    this._adView.style.width = width + "px";
    return this._adView.style.height = height + "px";
  };

  MRAIDContainer.prototype._setToDefaultPosition = function() {
    return this._setCurrentPosition(this._defaultPosition);
  };

  MRAIDContainer.prototype._expand = function() {
    return this._setCurrentPosition({
      x: 0,
      y: 0,
      width: this._expandProperties.width,
      height: this._expandProperties.height
    });
  };

  MRAIDContainer.prototype.expand = function(URL) {
    return this._adView.contentWindow.mraid.expand(URL);
  };

  MRAIDContainer.prototype.open = function(URL) {
    return this._emitter.emit('open', URL);
  };

  MRAIDContainer.prototype.close = function() {
    return this._adView.contentWindow.mraid.close();
  };

  MRAIDContainer.prototype.resume = function() {
    return this._adView.contentWindow.mraid._setViewable(true);
  };

  MRAIDContainer.prototype.appendTo = function(target) {
    this.parent = target;
    return target.appendChild(this._adView);
  };

  MRAIDContainer.prototype.show = function() {
    var mraid;
    this._adView.style.display = 'block';
    this._viewable = true;
    mraid = this._adView.contentWindow.mraid;
    if (mraid._setViewable != null) {
      return mraid._setViewable(true);
    }
  };

  MRAIDContainer.prototype.hide = function() {
    var mraid;
    this._adView.style.display = 'none';
    this._viewable = false;
    mraid = this._adView.contentWindow.mraid;
    if (mraid._setViewable != null) {
      return mraid._setViewable(false);
    }
  };

  MRAIDContainer.prototype._close = function() {
    this._adView.removeEventListener('load', this._initAdView);
    this.parent.removeChild(this._adView);
    delete this.parent;
    delete this._adView;
    return this._emitter.emit('close', this.id);
  };

  MRAIDContainer.prototype.on = function(event, listener) {
    return this._emitter.addListener(event, listener);
  };

  MRAIDContainer.prototype.off = function(event, listener) {
    return this._emitter.removeListener(event, listener);
  };

  return MRAIDContainer;

})();

module.exports = MRAIDContainer;


},{"events":1}],3:[function(require,module,exports){
var DEFAULT_POSITION, MRAIDContainer, MRAIDSDK, MRAID_VER;

MRAIDContainer = require('./container.coffee');

MRAID_VER = '2.0';

DEFAULT_POSITION = {
  x: 0,
  y: 0,
  width: 1280,
  height: 720
};

MRAIDSDK = (function() {
  function MRAIDSDK() {}

  MRAIDSDK.containers = {};

  MRAIDSDK.getVersion = function() {
    return MRAID_VER;
  };

  MRAIDSDK.createContainer = function(id, url) {
    var container, timeout;
    timeout = function(delay, func) {
      return setTimeout(func, delay);
    };
    if (this.containers[id]) {
      this.removeContainer(id);
    }
    container = this.containers[id] = new MRAIDContainer(id, url, {
      defaultPosition: DEFAULT_POSITION,
      placementType: 'interstitial'
    });
    container.on('close', (function(_this) {
      return function(_id) {
        return timeout(100, function() {
          return _this.removeContainer(_id);
        });
      };
    })(this));
    container.appendTo(document.body);
    timeout(100, (function(_this) {
      return function() {
        return container._adView.focus();
      };
    })(this));
    container.show();
    return container;
  };

  MRAIDSDK.removeContainer = function(id) {
    return delete this.containers[id];
  };

  return MRAIDSDK;

})();

module.exports = MRAIDSDK;


},{"./container.coffee":2}]},{},[3])(3)
});
//# sourceMappingURL=mraid-sdk.js.map
