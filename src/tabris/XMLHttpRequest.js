// Created based on the W3C XMLHttpRequest specifications: http://www.w3.org/TR/XMLHttpRequest/
// References to sections listed on the same line as the the function definition.
// Append the section tag to the URL above to get the link to the corresponding section.
// Steps are referenced to with a number inside parentheses, e.g. (2)

import NativeObject from './NativeObject';
import Event, {addDOMEventTargetMethods, defineEventHandlerProperties} from './Event';
import ProgressEvent from './ProgressEvent';

class HttpRequest extends NativeObject {

  constructor() {
    super();
    this._create('tabris.HttpRequest');
    this._nativeListen('StateChange', true);
    this._nativeListen('DownloadProgress', true);
    this._nativeListen('UploadProgress', true);
  }

}

const EVENT_TYPES = [
  'loadstart', 'readystatechange', 'load', 'loadend', 'progress', 'timeout', 'abort', 'error'
];
const UPLOAD_EVENT_TYPES = ['progress', 'loadstart', 'load', 'loadend', 'timeout', 'abort', 'error'];

// -----------------------------------------------------------------
// Constructor

export default function XMLHttpRequest() {
  let scope = createScopeObject(this);
  definePropertyUpload(this, scope);
  definePropertyReadyState(this, scope);
  definePropertyTimeout(this, scope);
  definePropertyResponse(this, scope);
  definePropertyResponseText(this, scope);
  definePropertyResponseType(this, scope);
  definePropertyStatus(this, scope);
  definePropertyStatusText(this, scope);
  definePropertyWithCredentials(this, scope);
  defineEventHandlerProperties(this, EVENT_TYPES);
  defineEventHandlerProperties(scope.uploadEventTarget, UPLOAD_EVENT_TYPES);
  initializeEventHandlers(scope);
  this.open = createOpenMethod(this, scope);
  this.send = createSendMethod(this, scope);
  this.abort = createAbortMethod(this, scope);
  this.setRequestHeader = createSetRequestHeaderMethod(this, scope);
  this.getResponseHeader = createGetResponseHeaderMethod(this, scope);
  this.getAllResponseHeaders = createGetAllResponseHeadersMethod(this, scope);
  addDOMEventTargetMethods(this);
  addDOMEventTargetMethods(scope.uploadEventTarget);
}

XMLHttpRequest.prototype = {
  UNSENT: 0,
  OPENED: 1,
  HEADERS_RECEIVED: 2,
  LOADING: 3,
  DONE: 4
};

// -----------------------------------------------------------------
// Properties

function createScopeObject(xhr) {
  return {
    proxy: null,
    authorRequestHeaders: {},
    uploadListeners: {},
    uploadEventTarget: {},
    timeout: 0,
    status: 0,
    statusText: '',
    responseHeaders: '',
    readyState: xhr.UNSENT,
    responseData: '',
    withCredentials: false,
    responseType: '',
    sendInvoked: false,
    isSynchronous: false,
    error: false,
    uploadComplete: false
  };
}

function initializeEventHandlers(scope) {
  EVENT_TYPES.forEach((eventType) => {
    scope['on' + eventType] = null;
  });
  UPLOAD_EVENT_TYPES.forEach((eventType) => {
    scope.uploadListeners['on' + eventType] = null;
  });
}

function definePropertyUpload(xhr, scope) {
  Object.defineProperty(xhr, 'upload', {
    get() {
      return scope.uploadEventTarget;
    },
    set() {}
  });
}

function definePropertyReadyState(xhr, scope) {
  Object.defineProperty(xhr, 'readyState', {
    get() {
      return scope.readyState;
    },
    set() {}
  });
}

function definePropertyTimeout(xhr, scope) {
  Object.defineProperty(xhr, 'timeout', { // #the-timeout-attribute
    get() {
      return scope.timeout;
    },
    set(value) {
      // (1): superfluous, as we don't support synchronous requests
      if (!isNaN(value)) { // (2)
        scope.timeout = Math.round(value);
      }
    }
  });
}

function definePropertyResponseText(xhr, scope) {
  // https://xhr.spec.whatwg.org/#the-responsetext-attribute
  Object.defineProperty(xhr, 'responseText', { // #dom-xmlhttprequest-responsetext
    get() {
      // 1. If responseType is not the empty string or "text", throw an InvalidStateError exception.
      if (scope.responseType !== '' && scope.responseType !== 'text') {
        throw new Error('XHR responseText not accessible for non-text responseType');
      }
      // 2. If state is not loading or done, return the empty string.
      if ((scope.readyState !== xhr.LOADING && scope.readyState !== xhr.DONE)) {
        return '';
      }
      // 3. Return the text response.
      return scope.responseData || '';
    },
    set() {}
  });
}

function definePropertyResponse(xhr, scope) {
  // https://xhr.spec.whatwg.org/#the-response-attribute
  Object.defineProperty(xhr, 'response', {
    get() {
      // If responseType is the empty string or "text"
      if (scope.responseType === '' || scope.responseType === 'string') {
        // 1. If state is not loading or done, return the empty string.
        if (scope.readyState !== xhr.LOADING && scope.readyState !== xhr.DONE) {
          return '';
        }
        // 2. Return the text response.
        return scope.responseData || '';
      }
      // Otherwise
      // 1. If state is not done, return null.
      if (scope.readyState !== xhr.DONE) {
        return null;
      }
      // 2. If responseType is "arraybuffer"
      // Return the arraybuffer response.
      return scope.responseData;
    },
    set() {}
  });
}

function definePropertyResponseType(xhr, scope) {
  // https://xhr.spec.whatwg.org/#the-responsetext-attribute
  Object.defineProperty(xhr, 'responseType', {
    get() {
      return scope.responseType;
    },
    set(value) {
      // 1. (concurrency related, skip)
      // 2. If state is loading or done, throw an InvalidStateError exception.
      if ((scope.readyState === xhr.LOADING || scope.readyState === xhr.DONE)) {
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
      scope.responseType = value;
    }
  });
}

function definePropertyStatus(xhr, scope) {
  Object.defineProperty(xhr, 'status', { // #the-status-attribute
    get() {
      if ([xhr.OPENED, xhr.UNSENT].indexOf(scope.readyState) > -1) { // (1)
        return 0;
      }
      if (scope.error) { // (2)
        return 0;
      }
      return scope.status; // (3)
    },
    set() {}
  });
}

function definePropertyStatusText(xhr, scope) {
  Object.defineProperty(xhr, 'statusText', {
    get() { // #the-statustext-attribute
      if ([xhr.OPENED, xhr.UNSENT].indexOf(scope.readyState) > -1) { // (1)
        return '';
      }
      if (scope.error) { // (2)
        return '';
      }
      return scope.statusText; // (3)
    },
    set() {}
  });
}

function definePropertyWithCredentials(xhr, scope) {
  Object.defineProperty(xhr, 'withCredentials', { // #the-withcredentials-attribute
    set(value) {
      if (scope.readyState !== xhr.UNSENT && scope.readyState !== xhr.OPENED) { // (1)
        throw new Error(
            "InvalidStateError: state must be 'UNSENT' or 'OPENED' when setting withCredentials"
        );
      }
      if (scope.sendInvoked) { // (2)
        throw new Error("InvalidStateError: 'send' invoked, failed to set 'withCredentials'");
      }
      // (3): superfluous as we don't support synchronous requests
      // mimicking Chromium and Firefox behaviour when setting a non-boolean value:
      if (typeof value === 'boolean') {
        scope.withCredentials = value; // (4)
      }
    },
    get() {
      return scope.withCredentials;
    }
  });
}

// -----------------------------------------------------------------
// Methods

function createOpenMethod(xhr, scope) {
  return function(method, url, async, username, password) { // #dom-xmlhttprequest-open
    let parsedUrl = {};
    // (2), (3), (4): we don't implement the 'settings' object
    validateRequiredOpenArgs(method, url);
    parsedUrl.source = url; // (8), (9): experimental non-standard parsing implementation:
    // regex taken from http://stackoverflow.com/a/8206299:
    let urlWithoutProtocol = url.replace(/.*?:\/\//g, '');
    // regex taken from http://stackoverflow.com/a/19709846:
    parsedUrl.isRelative = !new RegExp('^(?:[a-z]+:)?//', 'i').test(url);
    parsedUrl.userdata = urlWithoutProtocol.substring(0, urlWithoutProtocol.indexOf('@'));
    if (typeof async === 'undefined') { // (10)
      async = true;
      username = null;
      password = null;
    }
    if (!async) {
      throw new Error('Only asynchronous request supported.');
    }
    if (parsedUrl.isRelative) { // (11)
      if (username && password) {
        parsedUrl.userdata = username + ':' + password;
      }
    }
    // (12): superfluous as we don't support synchronous requests
    // TODO: (13) - should we call 'abort' to the proxy? We'd need to move the creation of the proxy
    // to the open() function
    scope.requestMethod = method; // (14)
    scope.requestUrl = parsedUrl;
    scope.isSynchronous = !async;
    scope.authorRequestHeaders = {};
    scope.sendInvoked = false;
    scope.responseData = null;
    if (scope.readyState !== xhr.OPENED) { // (15)
      scope.readyState = xhr.OPENED;
      dispatchEvent('readystatechange', xhr);
    }
  };
}

function createSendMethod(xhr, scope) {
  return function(data) { // #the-send()-method
    scope.proxy = new HttpRequest();
    scope.proxy.on('StateChange', event => stateChangeHandler(event, xhr, scope));
    scope.proxy.on('DownloadProgress', event => dispatchProgressEvent('progress', xhr, event));
    scope.proxy.on('UploadProgress', event => dispatchProgressEvent('progress', xhr.upload, event));
    if (scope.readyState !== xhr.OPENED) { // (1)
      throw new Error(
          "InvalidStateError: Object's state must be 'OPENED', failed to execute 'send'"
      );
    }
    if (scope.sendInvoked) { // (2)
      throw new Error("InvalidStateError: 'send' invoked, failed to execute 'send'");
    }
    if (['GET', 'HEAD'].indexOf(scope.requestMethod) > -1) { // (3)
      data = null;
    }
    scope.requestBody = data; // (4)
    // TODO: support encoding and mimetype for string response types
    // (5): no storage mutex
    scope.error = scope.uploadComplete = false; // (6), see (8)
    if (!data) { // (7)
      scope.uploadComplete = true;
    }
    // (8): uploadEvents is relevant for the "force preflight flag", but this logic is handled by
    // the client
    // Basic access authentication
    if (scope.withCredentials) {
      // TODO: encode userdata in base64, will not function if not encoded
      if (scope.requestUrl.userdata) {
        xhr.setRequestHeader('Authorization', 'Basic ' + scope.requestUrl.userdata);
      }
    }
    scope.sendInvoked = true; // (9.1)
    dispatchProgressEvent('loadstart', xhr); // (9.2)
    if (!scope.uploadComplete) {
      dispatchProgressEvent('loadstart', xhr.upload); // (9.3)
    }
    // (10): only handling the same origin case
    scope.proxy._nativeCall('send', { // request URL fetch
      url: scope.requestUrl.source,
      method: scope.requestMethod,
      timeout: xhr.timeout,
      headers: scope.authorRequestHeaders,
      data: scope.requestBody,
      responseType: scope.responseType
    });
  };
}

function createAbortMethod(xhr, scope) {
  return function() { // #the-abort()-method
    if (scope.proxy) {
      scope.proxy._nativeCall('abort'); // (1)
    }
    if (!([xhr.UNSENT, xhr.OPENED].indexOf(scope.readyState) > -1 && !scope.sendInvoked ||
        scope.readyState === xhr.DONE)) { // send() interrupted
      // (2.1), (2.2): setting readyState DONE with sendInvoked true or false seems to be an
      // internal state which doesn't affect the behavior and thus cannot be tested
      dispatchEvent('readystatechange', xhr); // (2.3)
      if (!scope.uploadComplete) {
        scope.uploadComplete = true; // (2.4.1)
        dispatchAbortProgressEvents(xhr.upload); // (2.4.2), (2.4.3), (2.4.4)
      }
      dispatchAbortProgressEvents(xhr); // (2.5), (2.6), (2.7)
    }
    scope.readyState = xhr.UNSENT; // (3)
  };
}

function createSetRequestHeaderMethod(xhr, scope) {
  return function(header, value) { // #dom-xmlhttprequest-setrequestheader
    if (scope.readyState !== xhr.OPENED) { // (1)
      throw new Error('InvalidStateError: ' +
              "Object's state must be 'OPENED', failed to execute 'setRequestHeader'");
    }
    if (scope.sendInvoked) { // (2)
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
    if (header in scope.authorRequestHeaders) { // (6):
      scope.authorRequestHeaders[header] = scope.authorRequestHeaders[header] + ', ' + value; // (7)
    } else {
      scope.authorRequestHeaders[header] = value; // (8)
    }
  };
}

function createGetResponseHeaderMethod(xhr, scope) {
  return function(header) { // #the-getresponseheader()-method
    if ([xhr.UNSENT, xhr.OPENED].indexOf(xhr.readyState) > -1) { // (1)
      return null;
    }
    if (scope.error) { // (2)
      return null;
    }
    // (3) (No headers are filtered out as this restriction does not apply to native apps)
    for (let key in scope.responseHeaders) { // (4), (5)
      if (key.toLowerCase() === header.toLowerCase()) {
        return scope.responseHeaders[key];
      }
    }
    return null; // (6)
  };
}

function createGetAllResponseHeadersMethod(xhr, scope) {
  return function() { // #the-getallresponseheaders()-method
    if ([xhr.UNSENT, xhr.OPENED].indexOf(xhr.readyState) > -1) { // (1)
      return '';
    }
    if (scope.error) { // (2)
      return '';
    }
    return stringifyResponseHeaders(scope.responseHeaders); // (3)
  };
}

function stringifyResponseHeaders(headers) {
  let string = [];
  for (let key in headers) {
    string.push(key + ': ' + headers[key]);
  }
  return string.join('\r\n');
}

// -----------------------------------------------------------------
// Event handler

function stateChangeHandler(e, xhr, scope) { // #infrastructure-for-the-send()-method
  // Note: we supply lengthComputable, loaded and total only with the "progress" event types
  switch (e.state) {
    case 'headers':
      scope.readyState = xhr.HEADERS_RECEIVED;
      scope.status = e.code;
      scope.statusText = e.message;
      scope.responseHeaders = e.headers;
      dispatchEvent('readystatechange', xhr);
      scope.uploadComplete = true; // #make-upload-progress-notifications
      dispatchFinishedProgressEvents(xhr.upload);
      break;
    case 'loading':
      scope.readyState = xhr.LOADING;
      dispatchEvent('readystatechange', xhr);
      break;
    case 'finished':
      // TODO create response based on responseType
      scope.responseData = e.response;
      scope.readyState = xhr.DONE;
      dispatchEvent('readystatechange', xhr);
      dispatchFinishedProgressEvents(xhr);
      dispatchFinishedProgressEvents(xhr.upload);
      scope.proxy.dispose();
      scope.proxy = null;
      break;
    case 'error':
      handleRequestError('error', xhr, scope);
      break;
    case 'timeout':
      handleRequestError('timeout', xhr, scope);
      break;
    case 'abort':
      handleRequestError('abort', xhr, scope);
      break;
  }
}

function handleRequestError(event, xhr, scope) { // #request-error
  scope.error = true; // (1*) (#terminate-the-request)
  scope.readyState = xhr.DONE; // (1)
  // (2): superfluous as we don't support synchronous requests
  dispatchEvent('readystatechange', xhr); // (3)
  dispatchErrorProgressEvents(event, xhr);
  if (!scope.uploadComplete) {
    scope.uploadComplete = true;
    dispatchErrorProgressEvents(event, xhr.upload);
  }
  scope.proxy.dispose();
  scope.proxy = null;
}

// -----------------------------------------------------------------
// Validators

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
  let tokens = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'TRACE', 'TRACK'];
  let uppercaseMethod = method.toUpperCase();
  if (tokens.indexOf(uppercaseMethod) >= 0) {
    method = uppercaseMethod;
  }
  let forbiddenTokens = ['CONNECT', 'TRACE', 'TRACK']; // (7)
  if (forbiddenTokens.indexOf(method) >= 0) {
    throw new Error(
            "SecurityError: '" + method + "' HTTP method is not secure, failed to execute 'open'"
    );
  }
}

function validHttpToken(httpToken) {
  // RFC-compliant validation for HTTP tokens ported from Chromium:
  // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
  let forbiddenCharacters = [
    '(', ')', '<', '>', '@', ',', ';', ':', '\\', '"', '\/', '[', ']', '?', '=', '{', '}'
  ];
  return !(/[^\x21-\x7E]/.test(httpToken) || forbiddenCharacters.indexOf(httpToken) >= 0);
}

function isValidHttpHeaderValue(value) {
  // non-RFC compliant validation for HTTP header values ported from Chromium:
  // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
  // Regex for Latin-1 characters based on: http://www.ic.unicamp.br/~stolfi/EXPORT/www/ISO-8859-1-Encoding.html
  return /^[\x09\x0A\x0D\x20-\x7E\xA0-\xFF]*$/.test(value) && value.indexOf('\n') < 0 && value.indexOf('\r') < 0;
}

let supportedSchemes = ['http', 'https', 'file'];

function validateUrl(url) {
  // TODO: rewrite (8),(9)
  let scheme = extractScheme(url);
  if (scheme && (supportedSchemes.indexOf(scheme) === -1)) {
    throw new SyntaxError("Unsupported URL scheme, failed to execute 'open'");
  }
}

function extractScheme(url) {
  let match = /^(\S+?):/.exec(url);
  return match ? match[1] : null;
}

// -----------------------------------------------------------------
// Event dispatcher

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
  // Note: progress event is dispatched separately by the DownloadProgress/UploadProgress callbacks
  dispatchProgressEvent('load', target);
  dispatchProgressEvent('loadend', target);
}
