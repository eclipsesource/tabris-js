import NativeObject from './NativeObject';
import Event, {addDOMEventTargetMethods, defineEventHandlerProperties} from './Event';
import {omit} from './util';
import ImageData from './ImageData';

const EVENT_TYPES = ['message', 'error', 'messageerror'];

class _Worker extends NativeObject {

  get _nativeType() {
    return 'tabris.Worker';
  }

}

NativeObject.defineProperty(_Worker.prototype, 'scriptPath', {type: 'string', default: ''});
NativeObject.defineEvents(_Worker.prototype, {
  message: {native: true},
  error: {native: true},
  messageError: true
});

export default class Worker {

  constructor(scriptPath) {
    if (typeof scriptPath !== 'string') {
      throw new Error('The Worker script path has to be of type string');
    }
    addDOMEventTargetMethods(this);
    defineEventHandlerProperties(this, EVENT_TYPES);
    Object.defineProperty(this, '_nativeObject', {
      enumerable: false, writable: false, value: this.$createProxy({scriptPath})
    });
  }

  $createProxy(scriptPath) {
    return new _Worker(scriptPath)
      .onMessage((event) => {
        this.dispatchEvent(Object.assign(new Event('message'), omit(event, ['target', 'type', 'timeStamp'])));
      }).onError((event) => {
        this.dispatchEvent(Object.assign(new Event('error'), omit(event, ['target', 'type', 'timeStamp'])));
      }).onMessageError((event) => {
        this.dispatchEvent(Object.assign(new Event('messageerror'), omit(event, ['target', 'type', 'timeStamp'])));
      });
  }

  postMessage(message, transferList) {
    this._validateMessage(message);
    this._nativeObject._nativeCall('postMessage', {message, transferList});
  }

  _validateMessage(message) {
    if (!this._isValidMessage(message)) {
      this.dispatchEvent(Object.assign(new Event('messageerror')));
    } else {
      if (message instanceof Array) {
        for (let i = 0; i < message.length; i++) {
          this._validateMessage(message[i]);
        }
      } else if (typeof (message) === 'object') {
        for (const property in message) {
          if (message.hasOwnProperty(property)) {
            this._validateMessage(message[property]);
          }
        }
      }
    }
  }

  _isValidMessage(message) {
    return message === undefined ||
      message === null ||
      typeof message === 'string' ||
      typeof message === 'number' ||
      typeof message === 'boolean' ||
      message &&
      (
        message.constructor === Object ||
        message.constructor === Array ||
        message.constructor === DataView ||
        message.constructor === ArrayBuffer ||
        message.constructor === ImageData
      );
  }

  terminate() {
    this._nativeObject._nativeCall('terminate');
  }

}
