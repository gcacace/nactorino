'use strict';

var _ = require('lodash');
var Promise = require('promise');

var __DEAD_LETTER_EVENT = '$deadLetter';

var defaultConfig = {
  silent: false
};

function Actor(receivers, config) {

  // Ensure constructor arguments
  if (typeof receivers !== 'object') {
    throw new Error('Required "receivers" argument missing!');
  }

  this._receivers = receivers;
  this._promise = Promise.resolve();
  this._config = _.extend({}, defaultConfig, config);
}

Actor.prototype._callEventReceiver = function (eventName, args) {
  if (!this._isEventReceiverDefined(eventName)) {
    // Check for dead letter
    if (!this._isEventReceiverDefined(__DEAD_LETTER_EVENT)) {
      // Fallback on default dead letter
      if (!this._config.silent) {
        console.warn.apply(console, ['No receiver for event "' + eventName + '"'].concat(args));
      }
      return;
    }
    // Call dead letter
    return this._receivers[__DEAD_LETTER_EVENT].apply(this, args);
  }
  // Call event receiver
  return this._receivers[eventName].apply(this, args);
};

Actor.prototype._isEventReceiverDefined = function (eventName) {
  return typeof this._receivers[eventName] === 'function';
};

Actor.prototype.ask = function (eventName) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  this._promise = this._promise
    .catch(function () {
      // Silently catch previously failed calls
    })
    .then(function () {
      // Call event receiver
      return self._callEventReceiver(eventName, args);
    });
  return this._promise;
};

module.exports = Actor;