import NativeObject from './NativeObject';
import Event, {addDOMEventTargetMethods, defineEventHandlerProperties} from './Event';
import {omit, isReadable, read} from './util';
import {warn} from './Console';

const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;
const CONSTANTS = {
  CONNECTING: {value: CONNECTING},
  OPEN: {value: OPEN},
  CLOSING: {value: CLOSING},
  CLOSED: {value: CLOSED}
};
const EVENT_TYPES = ['open', 'message', 'close', 'error'];

class _WebSocket extends NativeObject {

  constructor(properties) {
    super();
    this._create('tabris.WebSocket', properties);
    EVENT_TYPES.forEach(type => this._nativeListen(type, true));
  }

}

NativeObject.defineProperties(_WebSocket.prototype, {
  url: {type: 'string', default: ''},
  protocol: {type: 'any', default: ''},
  binaryType: {type: 'string', default: 'blob'},
  bufferedAmount: {type: 'number', nocache: true}
});

export default class WebSocket {

  constructor(url, protocol) {
    if (typeof url !== 'string') {
      throw new Error('The WebSocket url has to be of type string');
    }
    let scheme = extractScheme(url);
    if (!(scheme === 'ws' || scheme === 'wss')) {
      throw new Error("The WebSocket url has to have a scheme of 'ws' or 'wss' but is '" + scheme + "'");
    }
    if (typeof protocol !== 'string' && !Array.isArray(protocol)) {
      throw new Error('The WebSocket protocol has too be a string or an array of strings');
    }
    let protocols = Array.isArray(protocol) ? protocol : [protocol];
    this.url = url;
    this.readyState = CONNECTING;
    this.protocol = '';
    this.extensions = '';
    addDOMEventTargetMethods(this);
    defineEventHandlerProperties(this, EVENT_TYPES);
    this._proxy = this.$createProxy(url, protocols);
  }

  $createProxy(url, protocols) {
    return new _WebSocket({
      url,
      protocol: protocols
    }).on('open', event => {
      this.readyState = OPEN;
      this.protocol = event.protocol;
      this.extensions = event.extensions;
      this.dispatchEvent(Object.assign(new Event('open'), omit(event, ['target', 'type', 'timeStamp'])));
    }).on('message', event => {
      if (this.readyState === OPEN) {
        this.dispatchEvent(Object.assign(new Event('message'), omit(event, ['target', 'type', 'timeStamp'])));
      }
    }).on('close', event => {
      this.readyState = CLOSED;
      this.dispatchEvent(Object.assign(new Event('close'), omit(event, ['target', 'type', 'timeStamp'])));
    }).on('error', event => {
      this.readyState = CLOSED;
      this.dispatchEvent(Object.assign(new Event('error'), omit(event, ['target', 'type', 'timeStamp'])));
    });
  }

  set binaryType(binaryType) {
    this._proxy.binaryType = binaryType;
  }

  get binaryType() {
    return this._proxy.binaryType;
  }

  set bufferedAmount(bufferedAmount) {
    warn('Can not set read-only property "bufferedAmount"');
  }

  get bufferedAmount() {
    return this._proxy.bufferedAmount;
  }

  send(data) {
    if (this.readyState === CONNECTING) {
      throw new Error("Can not 'send' WebSocket message when WebSocket state is CONNECTING");
    }
    if (typeof data === 'string') {
      this._proxy._nativeCall('send', {data});
    } else if (isReadable(data)) {
      this._proxy._nativeCall('send', {data: read(data)});
    } else {
      throw new Error('Data of type ' + typeof data + " is not supported in WebSocket 'send' operation");
    }
  }

  close(code, reason) {
    if (code &&
      (typeof code !== 'number' || !(typeof code === 'number' && (code === 1000 || code >= 3000 && code <= 4999)))) {
      throw new Error('A given close code has to be either 1000 or in the range 3000 - 4999 inclusive');
    }
    if (reason && getStringByteSize(reason) > 123) {
      throw new Error('The close reason can not be larger than 123 utf-8 bytes');
    }
    if (this.readyState !== CLOSING && this.readyState !== CLOSED) {
      this.readyState = CLOSING;
      let properties = {};
      if (code) {
        properties.code = code;
      }
      if (reason) {
        properties.reason = reason;
      }
      this._proxy._nativeCall('close', properties);
    }
  }

}

Object.defineProperties(WebSocket, CONSTANTS);
Object.defineProperties(WebSocket.prototype, CONSTANTS);

function getStringByteSize(input) {
  let len = 0;
  // TODO: workaround for https://github.com/babel/babili/issues/430
  if (!input.length) {
    return 0;
  }
  for (let i = 0; i < input.length; i++) {
    let code = input.charCodeAt(i);
    if (code <= 0x7f) {
      len += 1;
    } else if (code <= 0x7ff) {
      len += 2;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
      // (Assume next char is the other [valid] half and just skip it)
      len += 4;
      i++;
    } else if (code < 0xffff) {
      len += 3;
    } else {
      len += 4;
    }
  }
  return len;
}

function extractScheme(url) {
  let match = /^(\S+?):/.exec(url);
  return match ? match[1] : null;
}
