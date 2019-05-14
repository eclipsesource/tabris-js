import {format} from './Formatter';
import {getStackTrace, getCurrentLine} from './util-stacktrace';

export const toXML = Symbol();

export default class Console {

  constructor() {
    this._registerPrintMethods(arguments[0]);
    this._prefixSpaces = 0;
    this._count = {};
  }

  trace() {
    this.log(getStackTrace(new Error('StackTrace')));
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
    if (obj && obj[toXML] instanceof Function) {
      this.log(obj[toXML]());
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
    for (const level of ['debug', 'info', 'log', 'warn', 'error']) {
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

let inHint = false;

export const toValueString = function(value) {
  try {
    if ((value instanceof Array || (value && value._array instanceof Array))) {
      const array = value instanceof Array ? value : value._array;
      const joined = `[${array.map(toValueString).join(', ')}]`;
      if (joined.length <= 40) {
        return joined;
      }
    }
    if (typeof value === 'string') {
      const escaped = value.slice(0, 40).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      return value.length > 40 ? `"${escaped}..."` : `"${escaped}"`;
    }
    if (value && value[toXML]) { // Alternative to using instanceof to avoid circular dependency
      return value._disposedToStringValue || value.toString();
    }
    if (value && (value instanceof Function)) {
      return value.name;
    }
    if (value && (value.constructor === Object)) {
      const json = JSON.stringify(value);
      if (json.length <= 40) {
        return json;
      }
    }
    if (value instanceof Object && (value.constructor instanceof Function)) {
      return value.constructor.name;
    }
    return value + '';
  } catch (ex) {
    return '[unknown]';
  }
};

export const hint = function(source, message) {
  if (inHint) {
    return; // prevent potential stack overflow
  }
  inHint = true;
  let line = '';
  let prefix = '';
  line = getCurrentLine(new Error());
  if (source && typeof source === 'string') {
    prefix = source + ': ';
  } else if (source) {
    prefix = toValueString(source) + ': ';
  }
  defaultConsole.warn(prefix + message + (line ? `\nSource: ${line}` : ''));
  inHint = false;
};
