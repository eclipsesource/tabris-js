import {format} from './Formatter';

export default class Console {

  constructor() {
    this._registerPrintMethods(arguments[0]);
    this._prefixSpaces = 0;
    this._count = {};
  }

  trace() {
    let stack = new Error().stack.split('\n');
    stack = stack.filter(filterStackLine);
    stack = stack.map(normalizeStackLine);
    this.log(stack.join('\n'));
  }

  assert(expression, ...args) {
    if (!expression) {
      args[0] = `Assertion failed${args.length === 0 ? '' : `: ${args[0]}`}`;
      this.error(...args);
    }
  }

  count(label) {
    label = label ? label : 'default';
    if (!this._count[label]) {
      this._count[label] = 0;
    }
    this.log('%s: %s', label, ++this._count[label]);
  }

  countReset(label) {
    label = label ? label : 'default';
    this.log('%s: %s', label, this._count[label] = 0);
  }

  dirxml(obj) {
    if (obj && obj.toXML instanceof Function) {
      this.log(obj.toXML());
    } else {
      this.log(obj);
    }
  }

  group(...args) {
    this.log(...args);
    this._prefixSpaces += 2;
  }

  groupEnd() {
    if (this._prefixSpaces > 0) {
      this._prefixSpaces -= 2;
    }
  }

  debug(...args) {
    this._console.debug(...args);
  }

  info(...args) {
    this._console.info(...args);
  }

  log(...args) {
    this._console.log(...args);
  }

  warn(...args) {
    this._console.warn(...args);
  }

  error(...args) {
    this._console.error(...args);
  }

  _registerPrintMethods(nativeConsole) {
    this._console = {};
    for (let level of ['debug', 'info', 'log', 'warn', 'error']) {
      this._console[level] = (...args) => {
        const message = this._prepareOutput(...args);
        tabris.trigger('log', {level, message});
        nativeConsole.print(level, message);
      };
    }
  }

  _prepareOutput(...args) {
    let output = format(...args);
    if (this._prefixSpaces > 0) {
      output = `${' '.repeat(this._prefixSpaces)}${output}`;
    }
    return output;
  }

}

export function createConsole(nativeConsole) {
  return new Console(nativeConsole);
}

const defaultConsole = global.console.print
  ? createConsole(global.console)
  : global.console;

if (!defaultConsole.debug) {
  // The native node console has no "debug" method
  defaultConsole.debug = function(...args) {
    defaultConsole.log(...args);
  };
}

export const debug = function(...args) { defaultConsole.debug(...args); };
export const info = function(...args) { defaultConsole.info(...args); };
export const log = function(...args) { defaultConsole.log(...args); };
export const warn = function(...args) { defaultConsole.warn(...args); };
export const error = function(...args) { defaultConsole.error(...args); };

const androidStackLineRegex = /^ +at +(.+) +\((.*):([0-9]+):([0-9]+)\)/;
const androidStackLineNoNameRegex = /^ +at +(.*):([0-9]+):([0-9]+)/;
const iosStackLineRegex = /^(.+)@(.*):([0-9]+):([0-9]+)/;
const iosStackLineNoNameRegex = /(.*):([0-9]+):([0-9]+)/;
const urlBaseRegEx = /^[a-z]+:\/\/[^/]+\//;

function filterStackLine(line) {
  if (tabris.device.platform === 'android' && !androidStackLineNoNameRegex.test(line)) {
    return false;
  }
  return line.indexOf('tabris/tabris.min.js:') === -1 && line.indexOf('@[native code]') === -1;
}

function normalizeStackLine(line) {
  const regex = tabris.device.platform === 'android' ? androidStackLineRegex : iosStackLineRegex;
  const noNameRegex = tabris.device.platform === 'android' ? androidStackLineNoNameRegex : iosStackLineNoNameRegex;
  const fullMatch = line.match(regex);
  const noNameMatch = line.match(noNameRegex);
  if (fullMatch && fullMatch.length === 5) {
    let [, fn, url, line, column] = fullMatch;
    return `${fn.split('.').pop()} (${fixUrl(url)}:${line}:${column})`;
  } else if (noNameMatch && noNameMatch.length === 4) {
    let [, url, line, column] = noNameMatch;
    return `${fixUrl(url)}:${line}:${column}`;
  } else {
    return line;
  }
}

function fixUrl(url) {
  const urlBase = url.match(urlBaseRegEx);
  if (urlBase) {
    return './' + url.slice(urlBase[0].length);
  }
  return url;
}
