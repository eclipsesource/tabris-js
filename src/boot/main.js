/*global document: true */
import Module from './Module';

global.window = global.self = global;
global.tabris = {}; // provisional object, will be replaced by tabris module

tabris._start = function(client) {
  try {
    tabris._client = client;
    let rootModule = new Module();
    try {
      rootModule.require('tabris');
      tabris._client = client; // required by head.append
    } catch (error) {
      console.print('error', 'Could not load tabris module: ' + (error.stack || error));
      return;
    }
    tabris._defineModule = function(id, fn) {
      return new Module(id, rootModule, fn);
    };
    // Initialize tabris (including version check) before loading cordova (see #1379)
    if (tabris._init) {
      tabris._init(client);
    }
    let cordovaScript = document.createElement('script');
    cordovaScript.src = './cordova.js';
    document.head.appendChild(cordovaScript);
    let loadMain = function() {
      try {
        rootModule.require('./');
        tabris.trigger('flush');
      } catch (error) {
        console.print('error', 'Could not load main module: ' + (error.stack || error));
      }
    };
    if (tabris._entryPoint) {
      tabris._entryPoint(loadMain);
      delete tabris._entryPoint;
    } else {
      loadMain();
    }
    tabris.trigger('flush');
  } catch (error) {
    console.print('error', (error.stack || error));
  }
};

tabris._notify = function() {
  // client may get the reference to _notify before tabris has been loaded
  return tabris._notify.apply(this, arguments);
};
