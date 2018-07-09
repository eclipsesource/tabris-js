/*global document: true */
import Module from './Module';

global.window = global.self = global;
global.tabris = {};

tabris._start = function(client) {
  try {
    tabris._client = client;
    let rootModule = new Module();
    try {
      rootModule.require('tabris');
      tabris._client = client; // required by head.append
    } catch (error) {
      printError('Could not load tabris module:', error);
      return;
    }
    tabris._defineModule = function(id, fn) {
      return new Module(id, rootModule, fn);
    };
    let cordovaScript = document.createElement('script');
    cordovaScript.src = './cordova.js';
    document.head.appendChild(cordovaScript);
    let isWorker = global.workerScriptPath !== undefined;
    if (tabris._init) {
      tabris._init(client, {headless: isWorker});
    }
    let loadModule = function() {
      try {
        if (global.debugClient && !isWorker) {
          global.debugClient.start();
        }
        rootModule.require('./' + (isWorker ? global.workerScriptPath : ''));
        tabris.trigger('flush');
      } catch (error) {
        printError('Could not load ' + (isWorker ? 'worker' : 'main module') + ':', error);
      }
    };
    if (tabris._entryPoint) {
      tabris._entryPoint(loadModule);
      delete tabris._entryPoint;
    } else {
      loadModule();
    }
    delete global.workerScriptPath;
    tabris.trigger('flush');
  } catch (error) {
    printError('Could not start tabris:', error);
  }
};

tabris._notify = function() {
  // client may get the reference to _notify before tabris has been loaded
  return tabris._notify.apply(this, arguments);
};

function printError(msg, error) {
  console.print ? console.print('error', msg + (error.stack || error)) : console.error(msg, error);
}
