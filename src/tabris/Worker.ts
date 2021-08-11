import NativeObject from './NativeObject';
import Event, {addDOMEventTargetMethods, defineEventHandlerProperties} from './Event';
import ImageData from './ImageData';
import type EventObject from './EventObject';

const EVENT_TYPES = ['message', 'error', 'messageerror'];

class _Worker extends NativeObject {

  scriptPath!: string;

  get _nativeType() {
    return 'tabris.Worker';
  }

  postMessage(param: {internal?: boolean, data: any}) {
    this._nativeCall('postMessage', param);
  }

  terminate() {
    this._nativeCall('terminate');
  }

}

NativeObject.defineProperties(_Worker.prototype, {
  scriptPath: {type: 'string', const: true, default: ''}
});

NativeObject.defineEvents(_Worker.prototype, {
  message: {native: true},
  error: {native: true},
  messageError: true
});

class Worker {

  onmessage?: Function;
  _nativeObject!: _Worker;

  constructor(scriptPath: string) {
    if (typeof scriptPath !== 'string') {
      throw new Error('The Worker script path has to be of type string');
    }
    addDOMEventTargetMethods(this);
    defineEventHandlerProperties(this, EVENT_TYPES);
    Object.defineProperty(this, '_nativeObject', {
      enumerable: false, writable: false, value: this.$createNativeObject(scriptPath)
    });
  }

  $createNativeObject(scriptPath: string) {
    return new _Worker({
      scriptPath
    }).on({
      _message: ({data, logs, internal}: any) => {
        try {
          if (logs instanceof Array) {
            for (const logData of logs) {
              tabris.trigger('log', logData);
            }
          }
        } finally {
          if (!internal) {
            this.dispatchEvent(Object.assign(new Event('message'), {data}));
          }
        }
      },
      _error: ({message}: {message: string}) => {
        this.dispatchEvent(Object.assign(new Event('error'), {message}));
      },
      _messageError: ({message}: EventObject) => {
        this.dispatchEvent(Object.assign(new Event('messageerror'), {message}));
      }
    });
  }

  postMessage(data?: any, transferList?: any[]) {
    validateMessage(data);
    this._nativeObject._nativeCall('postMessage', {data, transferList});
  }

  terminate() {
    this._nativeObject._nativeCall('postMessage', {internal: true, data: 'terminate'});
    this._nativeObject._nativeCall('terminate');
  }

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Worker extends DomEventTarget { }

export default Worker;

export function validateMessage(message: any) {
  if (!isValidMessage(message)) {
    throw new TypeError('The message could not be cloned');
  } else {
    if (message instanceof Array) {
      for (const messageEntry of message) {
        validateMessage(messageEntry);
      }
    } else if (typeof (message) === 'object') {
      for (const property in message) {
        if (Object.prototype.hasOwnProperty.call(message, property)) {
          validateMessage(message[property]);
        }
      }
    }
  }
}

export function isValidMessage(message: unknown) {
  return message === undefined ||
    message === null ||
    typeof message === 'string' ||
    typeof message === 'number' ||
    typeof message === 'boolean' ||
    message && typeof message === 'object' &&
    (
      message.constructor === Object ||
      message.constructor === Array ||
      message.constructor === DataView ||
      message.constructor === ArrayBuffer ||
      message.constructor === ImageData
    );
}
