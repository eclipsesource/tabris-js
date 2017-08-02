import {format} from './Formatter';

export function createConsole(nativeConsole) {
  let console = {};
  for (let name of ['debug', 'info', 'log', 'warn', 'error']) {
    console[name] = function(...args) {
      nativeConsole.print(name, format(...args));
    };
  }
  return console;
}

