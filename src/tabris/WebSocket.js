import NativeObject from './NativeObject';

let CONNECTING = 0;
let OPEN = 1;
let CLOSING = 2;
let CLOSED = 3;

let _WebSocket = NativeObject.extend({
  _type: 'tabris.WebSocket',
  _events: {
    open: true,
    message: true,
    error: true,
    close: true,
    bufferProcess: true
  },
  _properties: {
    url: {type: 'string', default: ''},
    protocol: {type: 'any', default: ''},
    binaryType: {type: 'string', default: 'blob'}
  }
});

export default function WebSocket(url, protocol) {

  if (typeof url !== 'string') {
    throw new Error('The WebSocket url has to be of type string');
  }
  let scheme = extractScheme(url);
  if (!(scheme === 'ws' || scheme === 'wss')) {
    throw new Error("The WebSocket url has to have a scheme of 'ws' or 'wss' but is '" + scheme + "'");
  }

  this.url = url;

  let protocolArray = [];
  if (typeof protocol === 'string') {
    protocolArray = [protocol];
  } else if (Array.isArray(protocol)) {
    // validate that all protocols are strings and no entry appears multiple times
    protocolArray = protocol;
  } else {
    throw new Error('The WebSocket protocol has too be a string or an array of strings');
  }

  this._proxy = new _WebSocket({
    url,
    protocol: protocolArray
  });

  this._proxy.on('open', function(event) {
    this.readyState = OPEN;
    this.protocol = event.protocol;
    this.extensions = event.extensions;
    if (typeof this.onopen === 'function') {
      this.onopen(event);
    }
  }, this);
  this._proxy.on('message', function(event) {
    if (this.readyState === OPEN && typeof this.onmessage === 'function') {
      this.onmessage(event);
    }
  }, this);
  this._proxy.on('close', function(event) {
    this.readyState = CLOSED;
    if (typeof this.onclose === 'function') {
      this.onclose(event);
    }
  }, this);
  this._proxy.on('error', function(event) {
    this.readyState = CLOSED;
    if (typeof this.onerror === 'function') {
      this.onerror(event);
    }
  }, this);
  this._proxy.on('bufferProcess', function(event) {
    this.bufferedAmount -= event.byteLength;
  }, this);
}

WebSocket.prototype = {

  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,

  url: '',
  readyState: CONNECTING,
  protocol: '',
  extensions: '',
  bufferedAmount: 0,

  set binaryType(binaryType) {
    this._proxy.set('binaryType', binaryType);
  },
  get binaryType() {
    return this._proxy.get('binaryType');
  },

  send(data) {
    if (this.readyState === CONNECTING) {
      throw new Error("Can not 'send' WebSocket message when WebSocket state is CONNECTING");
    }
    if (typeof data === 'string') {
      this.bufferedAmount += getStringByteSize(data);
      this._proxy._nativeCall('send', {data});
    } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      this.bufferedAmount += data.byteLength;
      this._proxy._nativeCall('send', {data});
    } else {
      throw new Error('Data of type ' + typeof data + " is not supported in WebSocket 'send' operation");
    }
  },

  close(code, reason) {
    if (code &&
      (typeof code !== 'number' || !(typeof code === 'number' && (code === 1000 || code >= 3000 && code <= 4999)))) {
      throw new Error('A given close code has to be either 1000 or in the range 3000 - 4999 inclusive');
    }
    if (reason && getStringByteSize(reason) > 123) {
      throw new Error('The close reason can not be larger than 123 utf-8 bytes');
    }
    if (this.readyState !== CLOSING || this.readyState !== CLOSED) {
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

};

if (typeof WebSocket === 'undefined') {
  window.WebSocket = tabris.WebSocket;
}

function getStringByteSize(input) {
  let len = 0;
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
