// XHR Spec: https://xhr.spec.whatwg.org/

import HttpRequest from './HttpRequest';
import Event, {addDOMEventTargetMethods, defineEventHandlerProperties} from './Event';
import ProgressEvent from './ProgressEvent';
import {getBytes} from './util';
import Blob from './Blob';
import FormData, {formDataToBlob} from './FormData';

const UNSENT = 0;
const OPENED = 1;
const HEADERS_RECEIVED = 2;
const LOADING = 3;
const DONE = 4;

const EVENT_TYPES = [
  'loadstart', 'readystatechange', 'load', 'loadend', 'progress', 'timeout', 'abort', 'error'
];
const UPLOAD_EVENT_TYPES = ['progress', 'loadstart', 'load', 'loadend', 'timeout', 'abort', 'error'];

const SUPPORTED_SCHEMES = ['http', 'https', 'file'];

export default class XMLHttpRequest {

  constructor() {
    this.$authorRequestHeaders = {};
    this.$timeout = 0;
    this.$status = 0;
    this.$statusText = '';
    this.$responseHeaders = '';
    this.$readyState = UNSENT;
    this.$responseData = '';
    this.$withCredentials = false;
    this.$responseType = '';
    this.$sendInvoked = false;
    this.$isSynchronous = false;
    this.$error = false;
    this.$uploadComplete = false;
    Object.defineProperty(this, 'upload', {value: {}});
    defineEventHandlerProperties(this, EVENT_TYPES);
    defineEventHandlerProperties(this.upload, UPLOAD_EVENT_TYPES);
    addDOMEventTargetMethods(this);
    addDOMEventTargetMethods(this.upload);
  }

  get readyState() {
    return this.$readyState;
  }

  get timeout() {
    return this.$timeout;
  }

  set timeout(value) {
    // (1): superfluous, as we don't support synchronous requests
    if (!isNaN(value)) { // (2)
      this.$timeout = Math.round(value);
    }
  }

  get responseText() {
    // 1. If responseType is not the empty string or "text", throw an InvalidStateError exception.
    if (this.$responseType !== '' && this.$responseType !== 'text') {
      throw new Error('XHR responseText not accessible for non-text responseType');
    }
    // 2. If state is not loading or done, return the empty string.
    if ((this.$readyState !== LOADING && this.$readyState !== DONE)) {
      return '';
    }
    // 3. Return the text response.
    return this.$responseData || '';
  }

  get response() {
    // If responseType is the empty string or "text"
    if (this.$responseType === '' || this.$responseType === 'string') {
      // 1. If state is not loading or done, return the empty string.
      if (this.$readyState !== LOADING && this.$readyState !== DONE) {
        return '';
      }
      // 2. Return the text response.
      return this.$responseData || '';
    }
    // Otherwise
    // 1. If state is not done, return null.
    if (this.$readyState !== DONE) {
      return null;
    }
    // 2. If responseType is "arraybuffer"
    // Return the arraybuffer response.
    return this.$responseData;
  }

  get responseType() {
    return this.$responseType;
  }

  set responseType(value) {
    // 1. (concurrency related, skip)
    // 2. If state is loading or done, throw an InvalidStateError exception.
    if ((this.$readyState === LOADING || this.$readyState === DONE)) {
      throw new Error('The response type cannot be set when state is LOADING or DONE.');
    }
    // 3. (concurrency related, skip)
    // 4. Set the responseType attribute's value to the given value.
    // mimicking Chromium and Firefox behaviour when setting a not allowed responseType:
    if (['arraybuffer', 'blob', 'document', 'json', 'text'].indexOf(value) < 0) {
      return;
    }
    // currently only the response types 'text' and 'arraybuffer' are supported
    if (['blob', 'document', 'json'].indexOf(value) > -1) {
      throw new Error("Unsupported responseType, only 'text' and 'arraybuffer' are supported");
    }
    this.$responseType = value;
  }

  get status() {
    if ([OPENED, UNSENT].indexOf(this.$readyState) > -1) {
      return 0;
    }
    if (this.$error) {
      return 0;
    }
    return this.$status;
  }

  get statusText() {
    if ([OPENED, UNSENT].indexOf(this.$readyState) > -1) {
      return '';
    }
    if (this.$error) {
      return '';
    }
    return this.$statusText;
  }

  get withCredentials() {
    return this.$withCredentials;
  }

  set withCredentials(value) {
    if (this.$readyState !== UNSENT && this.$readyState !== OPENED) {
      throw new Error(
        "InvalidStateError: state must be 'UNSENT' or 'OPENED' when setting withCredentials"
      );
    }
    if (this.$sendInvoked) {
      throw new Error("InvalidStateError: 'send' invoked, failed to set 'withCredentials'");
    }
    // (3): superfluous as we don't support synchronous requests
    // mimicking Chromium and Firefox behaviour when setting a non-boolean value:
    if (typeof value === 'boolean') {
      this.$withCredentials = value; // (4)
    }
  }

  open(method, url, async) {
    const parsedUrl = {};
    // (2), (3), (4): we don't implement the 'settings' object
    validateRequiredOpenArgs(method, url);
    parsedUrl.source = url; // (8), (9): experimental non-standard parsing implementation:
    // regex taken from http://stackoverflow.com/a/19709846:
    parsedUrl.isRelative = !new RegExp('^(?:[a-z]+:)?//', 'i').test(url);
    if (typeof async === 'undefined') { // (10)
      async = true;
    }
    if (!async) {
      throw new Error('Only asynchronous request supported.');
    }
    // (12): superfluous as we don't support synchronous requests
    // TODO: (13) - should we call 'abort' to the nativeObject? We'd need to move the creation of the nativeObject
    // to the open() function
    this.$requestMethod = method; // (14)
    this.$requestUrl = parsedUrl;
    this.$isSynchronous = !async;
    this.$authorRequestHeaders = {};
    this.$sendInvoked = false;
    this.$responseData = null;
    if (this.$readyState !== OPENED) { // (15)
      this.$readyState = OPENED;
      dispatchEvent('readystatechange', this);
    }
  }

  send(data) {
    this.$nativeObject = new HttpRequest()
      .on('stateChanged', event => handleStateChange(event, this))
      .on('downloadProgress', event => dispatchProgressEvent('progress', this, event))
      .on('uploadProgress', event => dispatchProgressEvent('progress', this.upload, event));
    if (this.$readyState !== OPENED) { // (1)
      throw new Error(
        "InvalidStateError: Object's state must be 'OPENED', failed to execute 'send'"
      );
    }
    if (this.$sendInvoked) { // (2)
      throw new Error("InvalidStateError: 'send' invoked, failed to execute 'send'");
    }
    if (['GET', 'HEAD'].indexOf(this.$requestMethod) > -1) { // (3)
      data = null;
    }
    if (data instanceof FormData) {
      data = formDataToBlob(data);
    }
    this.$requestBody = (data && getBytes(data)) ? getBytes(data) : data; // (4)
    if (
      (data instanceof Blob)
      && Object.keys(this.$authorRequestHeaders).map(str => str.toLowerCase()).indexOf('content-type') === -1
    ) {
      this.$authorRequestHeaders['Content-Type'] = data.type;
    }
    // TODO: support encoding and mimetype for string response types
    // (5): no storage mutex
    this.$error = this.$uploadComplete = false; // (6), see (8)
    if (!data) { // (7)
      this.$uploadComplete = true;
    }
    // (8): uploadEvents is relevant for the "force preflight flag", but this logic is handled by
    // the client
    // Basic access authentication
    this.$sendInvoked = true; // (9.1)
    dispatchProgressEvent('loadstart', this); // (9.2)
    if (!this.$uploadComplete) {
      dispatchProgressEvent('loadstart', this.upload); // (9.3)
    }
    // (10): only handling the same origin case
    this.$nativeObject.send({ // request URL fetch
      url: this.$requestUrl.source,
      method: this.$requestMethod,
      timeout: this.timeout,
      headers: this.$authorRequestHeaders,
      data: this.$requestBody,
      responseType: this.$responseType
    });
  }

  abort() {
    if (this.$nativeObject) {
      this.$nativeObject.abort(); // (1)
    }
    if (!([UNSENT, OPENED].indexOf(this.$readyState) > -1 && !this.$sendInvoked ||
        this.$readyState === DONE)) { // send() interrupted
      // (2.1), (2.2): setting readyState DONE with sendInvoked true or false seems to be an
      // internal state which doesn't affect the behavior and thus cannot be tested
      dispatchEvent('readystatechange', this); // (2.3)
      if (!this.$uploadComplete) {
        this.$uploadComplete = true; // (2.4.1)
        dispatchAbortProgressEvents(this.upload); // (2.4.2), (2.4.3), (2.4.4)
      }
      dispatchAbortProgressEvents(this); // (2.5), (2.6), (2.7)
    }
    this.$readyState = UNSENT; // (3)
  }

  setRequestHeader(header, value) { // #dom-xmlhttprequest-setrequestheader
    if (this.$readyState !== OPENED) { // (1)
      throw new Error('InvalidStateError: ' +
              "Object's state must be 'OPENED', failed to execute 'setRequestHeader'");
    }
    if (this.$sendInvoked) { // (2)
      throw new Error('InvalidStateError: ' +
              "cannot set request header if 'send()' invoked and request not completed");
    }
    if (!validHttpToken(header)) { // (3)
      throw new TypeError("Invalid HTTP header name, failed to execute 'open'");
    }
    if (!isValidHttpHeaderValue(value)) { // (4)
      throw new TypeError("Invalid HTTP header value, failed to execute 'open'");
    }
    // (5) (No headers are filtered out as this restriction does not apply to native apps)
    if (header in this.$authorRequestHeaders) { // (6):
      this.$authorRequestHeaders[header] = this.$authorRequestHeaders[header] + ', ' + value; // (7)
    } else {
      this.$authorRequestHeaders[header] = value; // (8)
    }
  }

  getResponseHeader(header) { // #the-getresponseheader()-method
    if ([UNSENT, OPENED].indexOf(this.readyState) > -1) { // (1)
      return null;
    }
    if (this.$error) { // (2)
      return null;
    }
    // (3) (No headers are filtered out as this restriction does not apply to native apps)
    for (const key in this.$responseHeaders) { // (4), (5)
      if (key.toLowerCase() === header.toLowerCase()) {
        return this.$responseHeaders[key];
      }
    }
    return null; // (6)
  }

  getAllResponseHeaders() { // #the-getallresponseheaders()-method
    if ([UNSENT, OPENED].indexOf(this.readyState) > -1) { // (1)
      return '';
    }
    if (this.$error) { // (2)
      return '';
    }
    const result = [];
    for (const key in this.$responseHeaders) {
      result.push(key + ': ' + this.$responseHeaders[key]);
    }
    return result.join('\r\n');
  }

}

Object.defineProperties(XMLHttpRequest.prototype, {
  UNSENT: {value: UNSENT},
  OPENED: {value: OPENED},
  HEADERS_RECEIVED: {value: HEADERS_RECEIVED},
  LOADING: {value: LOADING},
  DONE: {value: DONE}
});

function handleStateChange(event, xhr) {
  // Note: we supply lengthComputable, loaded and total only with the "progress" event types
  switch (event.state) {
    case 'headers':
      xhr.$readyState = HEADERS_RECEIVED;
      xhr.$status = event.code;
      xhr.$statusText = event.message;
      xhr.$responseHeaders = event.headers;
      dispatchEvent('readystatechange', xhr);
      xhr.$uploadComplete = true; // #make-upload-progress-notifications
      dispatchFinishedProgressEvents(xhr.upload);
      break;
    case 'loading':
      xhr.$readyState = LOADING;
      dispatchEvent('readystatechange', xhr);
      break;
    case 'finished':
      // TODO create response based on responseType
      xhr.$responseData = event.response;
      xhr.$readyState = DONE;
      dispatchEvent('readystatechange', xhr);
      dispatchFinishedProgressEvents(xhr);
      dispatchFinishedProgressEvents(xhr.upload);
      xhr.$nativeObject.dispose();
      xhr.$nativeObject = null;
      break;
    case 'error':
      handleRequestError('error', xhr);
      break;
    case 'timeout':
      handleRequestError('timeout', xhr);
      break;
    case 'abort':
      handleRequestError('abort', xhr);
      break;
  }
}

function handleRequestError(type, xhr) {
  xhr.$error = true; // (1*) (#terminate-the-request)
  xhr.$readyState = DONE; // (1)
  // (2): superfluous as we don't support synchronous requests
  dispatchEvent('readystatechange', xhr); // (3)
  dispatchErrorProgressEvents(type, xhr);
  if (!xhr.$uploadComplete) {
    xhr.$uploadComplete = true;
    dispatchErrorProgressEvents(type, xhr.upload);
  }
  xhr.$nativeObject.dispose();
  xhr.$nativeObject = null;
}

function validateRequiredOpenArgs(method, url) {
  if (!method) {
    throw new TypeError("Method argument should be specified to execute 'open'");
  }
  if (!url) {
    throw new TypeError("URL argument should be specified to execute 'open'");
  }
  validateMethod(method);
  validateUrl(url);
}

function validateMethod(method) {
  if (!validHttpToken(method)) {
    throw new TypeError("Invalid HTTP method, failed to execute 'open'");
  }
  // (6):
  const tokens = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'TRACE', 'TRACK'];
  const uppercaseMethod = method.toUpperCase();
  if (tokens.indexOf(uppercaseMethod) >= 0) {
    method = uppercaseMethod;
  }
  const forbiddenTokens = ['CONNECT', 'TRACE', 'TRACK']; // (7)
  if (forbiddenTokens.indexOf(method) >= 0) {
    throw new Error(`SecurityError: '${method}' HTTP method is not secure, failed to execute 'open'`);
  }
}

function validHttpToken(httpToken) {
  // RFC-compliant validation for HTTP tokens ported from Chromium:
  // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
  const forbiddenCharacters = ['(', ')', '<', '>', '@', ',', ';', ':', '\\', '"', '/', '[', ']', '?', '=', '{', '}'];
  return !(/[^\x21-\x7E]/.test(httpToken) || forbiddenCharacters.indexOf(httpToken) >= 0);
}

function isValidHttpHeaderValue(value) {
  // non-RFC compliant validation for HTTP header values ported from Chromium:
  // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
  // Regex for Latin-1 characters based on: http://www.ic.unicamp.br/~stolfi/EXPORT/www/ISO-8859-1-Encoding.html
  return /^[\x09\x0A\x0D\x20-\x7E\xA0-\xFF]*$/.test(value) && value.indexOf('\n') < 0 && value.indexOf('\r') < 0;
}

function validateUrl(url) {
  // TODO: rewrite (8),(9)
  const scheme = extractScheme(url);
  if (scheme && (SUPPORTED_SCHEMES.indexOf(scheme) === -1)) {
    throw new SyntaxError("Unsupported URL scheme, failed to execute 'open'");
  }
}

function extractScheme(url) {
  const match = /^(\S+?):/.exec(url);
  return match ? match[1] : null;
}

function dispatchEvent(type, target) {
  target.dispatchEvent(new Event(type));
}

function dispatchProgressEvent(type, target, config) {
  target.dispatchEvent(new ProgressEvent(type, config));
}

function dispatchAbortProgressEvents(target) {
  dispatchProgressEvent('progress', target);
  dispatchProgressEvent('abort', target);
  dispatchProgressEvent('loadend', target);
}

function dispatchErrorProgressEvents(type, target) {
  dispatchProgressEvent('progress', target);
  dispatchProgressEvent(type, target);
  dispatchProgressEvent('loadend', target);
}

function dispatchFinishedProgressEvents(target) {
  // Note: progress event is dispatched separately by the downloadProgress/uploadProgress callbacks
  dispatchProgressEvent('load', target);
  dispatchProgressEvent('loadend', target);
}
