/* global document: true */
import Module from './Module';

global.window = global.self = global;
global.tabris = {} as ProtoTabris;

tabris._start = function(client) {
  try {
    tabris._client = client;
    const rootModule = Module.root;
    global.module = rootModule;
    global.require = rootModule.require.bind(rootModule);
    global.exports = rootModule.exports;
    global.__dirname = './';
    global.__filename = '.';
    try {
      rootModule.require('tabris');
      tabris._client = client; // required by head.append
    } catch (error) {
      printError('Could not load tabris module:', error as Error);
      return;
    }
    tabris.Module = Module;
    tabris._defineModule = function(id, fn) {
      return new Module(id, rootModule, fn);
    };
    const cordovaScript = document.createElement('script');
    cordovaScript.src = './cordova.js';
    document.head.appendChild(cordovaScript);
    const workerScriptPath = global.workerScriptPath;
    delete global.workerScriptPath;
    const isWorker = workerScriptPath !== undefined;
    if (tabris._init) {
      tabris._init(client, {headless: isWorker});
    }
    const loadModule = function() {
      try {
        if (global.debugClient && !isWorker) {
          global.debugClient.start(rootModule);
        }
        rootModule.require('./' + (isWorker ? workerScriptPath : ''));
        tabris.flush();
      } catch (error) {
        printError('Could not load ' + (isWorker ? 'worker' : 'main module') + ':', error as Error);
      }
    };
    if (tabris._entryPoint) {
      tabris._entryPoint(loadModule);
      tabris._entryPoint = null;
    } else {
      loadModule();
    }
    tabris.flush();
  } catch (error) {
    printError('Could not start tabris:', error as Error);
  }
};

tabris._notify = function(...args: any[]) {
  // client may get the reference to _notify before tabris has been loaded
  return tabris._notify.apply(this, args);
};

function printError(msg: string, error: Error) {
  if (console.print) {
    console.print('error', msg + (error.stack || error));
  } else {
    console.error!(msg, error);
  }
}
