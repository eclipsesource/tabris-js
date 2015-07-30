/*global XMLHttpRequest: true */

// Created based on the W3C XMLHttpRequest specifications: http://www.w3.org/TR/XMLHttpRequest/
// References to sections listed on the same line as the the function definition.
// Append the section tag to the URL above to get the link to the corresponding section.
// Steps are referenced to with a number inside parentheses, e.g. (2)

(function() {

  tabris.registerType("_HttpRequest", {
    _type: "tabris.HttpRequest",
    _events: {StateChange: true, DownloadProgress: true, UploadProgress: true}
  });

  var eventTypes = [
    "loadstart", "readystatechange", "load", "loadend", "progress", "timeout", "abort", "error"
  ];
  var uploadEventTypes = ["progress", "loadstart", "load", "loadend", "timeout", "abort", "error"];

  // -----------------------------------------------------------------
  // Constructor

  tabris.XMLHttpRequest = function() {
    var scope = createScopeObject(this);
    definePropertyUpload(this, scope);
    definePropertyReadyState(this, scope);
    definePropertyTimeout(this, scope);
    definePropertyResponse(this, scope);
    definePropertyResponseText(this, scope);
    definePropertyResponseType(this, scope);
    definePropertyStatus(this, scope);
    definePropertyStatusText(this, scope);
    definePropertyWithCredentials(this, scope);
    defineEventHandlers(this, scope);
    initializeEventHandlers(scope);
    this.open = createOpenMethod(this, scope);
    this.send = createSendMethod(this, scope);
    this.abort = createAbortMethod(this, scope);
    this.setRequestHeader = createSetRequestHeaderMethod(this, scope);
    this.getResponseHeader = createGetResponseHeaderMethod(this, scope);
    this.getAllResponseHeaders = createGetAllResponseHeadersMethod(this, scope);
    tabris._addDOMEventTargetMethods(this);
    tabris._addDOMEventTargetMethods(scope.uploadEventTarget);
  };

  tabris.XMLHttpRequest.prototype = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  };

  // -----------------------------------------------------------------
  // Events

  tabris.XMLHttpRequestProgressEvent = function(type) {
    this.type = type;
  };

  tabris.XMLHttpRequestProgressEvent.prototype = util.extendPrototype(tabris.DOMEvent, {
    lengthComputable: false,
    loaded: 0,
    total: 0
  });

  // -----------------------------------------------------------------
  // Properties

  var createScopeObject = function(xhr) {
    var scope = {};
    scope.proxy = null;
    scope.authorRequestHeaders = {};
    scope.uploadListeners = {};
    scope.uploadEventTarget = {};
    scope.timeout = 0;
    scope.status = 0;
    scope.statusText = "";
    scope.responseHeaders = "";
    scope.readyState = xhr.UNSENT;
    scope.responseText = "";
    scope.withCredentials = false;
    scope.responseType = "";
    scope.sendInvoked = false;
    scope.isSynchronous = false;
    scope.error = false;
    scope.uploadComplete = false;
    return scope;
  };

  var initializeEventHandlers = function(scope) {
    eventTypes.forEach(function(eventType) {
      scope["on" + eventType] = null;
    });
    uploadEventTypes.forEach(function(eventType) {
      scope.uploadListeners["on" + eventType] = null;
    });
  };

  var definePropertyUpload = function(xhr, scope) {
    Object.defineProperty(xhr, "upload", {
      get: function() {
        return scope.uploadEventTarget;
      },
      set: function() {}
    });
  };

  var definePropertyReadyState = function(xhr, scope) {
    Object.defineProperty(xhr, "readyState", {
      get: function() {
        return scope.readyState;
      },
      set: function() {}
    });
  };

  var definePropertyTimeout = function(xhr, scope) {
    Object.defineProperty(xhr, "timeout", { // #the-timeout-attribute
      get: function() {
        return scope.timeout;
      },
      set: function(value) {
        // (1): superfluous, as we don't support synchronous requests
        if (!isNaN(value)) { // (2)
          scope.timeout = Math.round(value);
        }
      }
    });
  };

  var definePropertyResponseText = function(xhr, scope) {
    Object.defineProperty(xhr, "responseText", { // #dom-xmlhttprequest-responsetext
      get: function() {
        // Steps merged with #text-response-entity-body, entity body steps marked with '*'
        // Note: HttpRequest's response is already stringified
        if (scope.responseText === null) { // (1*)
          return "";
        }
        if (typeof scope.responseText !== "string") { // (1*)
          throw new Error("IllegalStateError: responseText is not a string");
        }
        if ((scope.readyState !== xhr.LOADING && scope.readyState !== xhr.DONE)) { // (2)
          return "";
        }
        if (scope.error) { // (3)
          return "";
        }
        return scope.responseText;
      },
      set: function() {}
    });
  };

  var definePropertyResponse = function(xhr, scope) {
    Object.defineProperty(xhr, "response", { // #dom-xmlhttprequest-responsetext
      get: function() {
        // Note: only the if-statement implemented, as response types different than 'text' are
        // currently not supported
        if (scope.readyState !== xhr.LOADING && scope.readyState !== xhr.DONE) { // (1)
          return "";
        }
        if (scope.error) { // (2)
          return "";
        }
        return scope.responseText; // (3)
      },
      set: function() {}
    });
  };

  var definePropertyResponseType = function(xhr, scope) {
    Object.defineProperty(xhr, "responseType", { // #dom-xmlhttprequest-responsetype
      get: function() {
        return scope.responseType;
      },
      set: function(value) {
        if ((scope.readyState === xhr.LOADING || scope.readyState === xhr.DONE)) { // (1)
          throw new Error(
              "InvalidStateError: state must not be 'LOADING' or 'DONE' when setting responseType"
          );
        }
        // (2): superfluous as we don't support synchronous requests
        // (3): we don't handle the concurrency in this layer, so no worker environments
        // mimicking Chromium and Firefox behaviour when setting a not allowed responseType:
        if (["arraybuffer", "blob", "document", "json", "text"].indexOf(value) < 0) {
          return;
        }
        // currently only the 'text' response type is supported
        if (["arraybuffer", "blob", "document", "json"].indexOf(value) > -1) {
          throw new Error("Only the 'text' response type is supported.");
        }
        scope.responseType = value;
      }
    });
  };

  var defineEventHandlers = function(xhr, scope) {
    eventTypes.forEach(function(eventType) {
      defineEventHandler(eventType, xhr, scope);
    });
    uploadEventTypes.forEach(function(eventType) {
      defineEventHandler(eventType, scope.uploadEventTarget, scope.uploadListeners);
    });
  };

  var defineEventHandler = function(eventType, target, listeners) {
    var handler = "on" + eventType;
    Object.defineProperty(target, handler, {
      get: function() {
        return listeners[handler];
      },
      set: function(value) {
        // mimicks the behavior of Firefox and Chromium
        if (typeof value === "function") {
          target.removeEventListener(eventType, target[handler]);
          listeners[handler] = value;
          target.addEventListener(eventType, target[handler]);
        }
      }
    });
  };

  var definePropertyStatus = function(xhr, scope) {
    Object.defineProperty(xhr, "status", { // #the-status-attribute
      get: function() {
        if ([xhr.OPENED, xhr.UNSENT].indexOf(scope.readyState) > -1) { // (1)
          return 0;
        }
        if (scope.error) { // (2)
          return 0;
        }
        return scope.status; // (3)
      },
      set: function() {}
    });
  };

  var definePropertyStatusText = function(xhr, scope) {
    Object.defineProperty(xhr, "statusText", {
      get: function() { // #the-statustext-attribute
        if ([xhr.OPENED, xhr.UNSENT].indexOf(scope.readyState) > -1) { // (1)
          return "";
        }
        if (scope.error) { // (2)
          return "";
        }
        return scope.statusText; // (3)
      },
      set: function() {}
    });
  };

  var definePropertyWithCredentials = function(xhr, scope) {
    Object.defineProperty(xhr, "withCredentials", { // #the-withcredentials-attribute
      set: function(value) {
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
        if (typeof value === "boolean") {
          scope.withCredentials = value; // (4)
        }
      },
      get: function() {
        return scope.withCredentials;
      }
    });
  };

  // -----------------------------------------------------------------
  // Methods

  var createOpenMethod = function(xhr, scope) {
    return function(method, url, async, username, password) { // #dom-xmlhttprequest-open
      var parsedUrl = {};
      // (2), (3), (4): we don't implement the 'settings' object
      validateRequiredOpenArgs(method, url);
      parsedUrl.source = url; // (8), (9): experimental non-standard parsing implementation:
      // regex taken from http://stackoverflow.com/a/8206299:
      var urlWithoutProtocol = url.replace(/.*?:\/\//g, "");
      // regex taken from http://stackoverflow.com/a/19709846:
      parsedUrl.isRelative = !new RegExp("^(?:[a-z]+:)?//", "i").test(url);
      parsedUrl.userdata = urlWithoutProtocol.substring(0, urlWithoutProtocol.indexOf("@"));
      if (typeof async === "undefined") { // (10)
        async = true;
        username = null;
        password = null;
      }
      if (!async) {
        throw new Error("Only asynchronous request supported.");
      }
      if (parsedUrl.isRelative) { // (11)
        if (username && password) {
          parsedUrl.userdata = username + ":" + password;
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
      scope.responseText = null;
      if (scope.readyState !== xhr.OPENED) { // (15)
        scope.readyState = xhr.OPENED;
        dispatchXHREvent("readystatechange", xhr);
      }
    };
  };

  var createSendMethod = function(xhr, scope) {
    return function(data) { // #the-send()-method
      scope.proxy = tabris.create("_HttpRequest");
      scope.proxy.on("StateChange", function(e) {
        stateChangeHandler(e, xhr, scope);
      });
      scope.proxy.on("DownloadProgress", function(e) {
        dispatchProgressEvent("progress", xhr, e.lengthComputable, e.loaded, e.total);
      });
      scope.proxy.on("UploadProgress", function(e) {
        dispatchProgressEvent("progress", xhr.upload, e.lengthComputable, e.loaded, e.total);
      });
      if (scope.readyState !== xhr.OPENED) { // (1)
        throw new Error(
            "InvalidStateError: Object's state must be 'OPENED', failed to execute 'send'"
        );
      }
      if (scope.sendInvoked) { // (2)
        throw new Error("InvalidStateError: 'send' invoked, failed to execute 'send'");
      }
      if (["GET", "HEAD"].indexOf(scope.requestMethod) > -1) { // (3)
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
          xhr.setRequestHeader("Authorization", "Basic " + scope.requestUrl.userdata);
        }
      }
      scope.sendInvoked = true; // (9.1)
      dispatchProgressEvent("loadstart", xhr); // (9.2)
      if (!scope.uploadComplete) {
        dispatchProgressEvent("loadstart", xhr.upload); // (9.3)
      }
      // (10): only handling the same origin case
      scope.proxy._nativeCall("send", { // request URL fetch
        url: scope.requestUrl.source,
        method: scope.requestMethod,
        timeout: xhr.timeout,
        headers: scope.authorRequestHeaders,
        data: scope.requestBody
      });
    };
  };

  var createAbortMethod = function(xhr, scope) {
    return function() { // #the-abort()-method
      if (scope.proxy) {
        scope.proxy._nativeCall("abort"); // (1)
      }
      if (!([xhr.UNSENT, xhr.OPENED].indexOf(scope.readyState) > -1 && !scope.sendInvoked ||
          scope.readyState === xhr.DONE)) { // send() interrupted
        // (2.1), (2.2): setting readyState DONE with sendInvoked true or false seems to be an
        // internal state which doesn't affect the behavior and thus cannot be tested
        dispatchXHREvent("readystatechange", xhr); // (2.3)
        if (!scope.uploadComplete) {
          scope.uploadComplete = true; // (2.4.1)
          dispatchAbortProgressEvents(xhr.upload); // (2.4.2), (2.4.3), (2.4.4)
        }
        dispatchAbortProgressEvents(xhr); // (2.5), (2.6), (2.7)
      }
      scope.readyState = xhr.UNSENT; // (3)
    };
  };

  var createSetRequestHeaderMethod = function(xhr, scope) {
    return function(header, value) { // #dom-xmlhttprequest-setrequestheader
      if (scope.readyState !== xhr.OPENED) { // (1)
        throw new Error("InvalidStateError: " +
                "Object's state must be 'OPENED', failed to execute 'setRequestHeader'");
      }
      if (scope.sendInvoked) { // (2)
        throw new Error("InvalidStateError: " +
                "cannot set request header if 'send()' invoked and request not completed");
      }
      if (!validHttpToken(header)) { // (3)
        throw new TypeError("Invalid HTTP header name, failed to execute 'open'");
      }
      if (!isValidHttpHeaderValue(value)) { // (4)
        throw new TypeError("Invalid HTTP header value, failed to execute 'open'");
      }
      if (isForbiddenHeader(header)) { // (5)
        throw new Error("Cannot set forbidden header '" + header + "'");
      }
      if (header in scope.authorRequestHeaders) { // (6):
        scope.authorRequestHeaders[header] = scope.authorRequestHeaders[header] + ", " + value; // (7)
      } else {
        scope.authorRequestHeaders[header] = value; // (8)
      }
    };
  };

  var createGetResponseHeaderMethod = function(xhr, scope) {
    return function(header) { // #the-getresponseheader()-method
      if ([xhr.UNSENT, xhr.OPENED].indexOf(xhr.readyState) > -1) { // (1)
        return null;
      }
      if (scope.error) { // (2)
        return null;
      }
      var forbiddenHeaders = ["set-cookie", "set-cookie2", "status"]; // (3)
      if (forbiddenHeaders.indexOf(header.toLowerCase()) > -1) {
        return null;
      }
      for (var key in scope.responseHeaders) { // (4), (5)
        if (key.toLowerCase() === header.toLowerCase()) {
          return scope.responseHeaders[key];
        }
      }
      return null; // (6)
    };
  };

  var createGetAllResponseHeadersMethod = function(xhr, scope) {
    return function() { // #the-getallresponseheaders()-method
      if ([xhr.UNSENT, xhr.OPENED].indexOf(xhr.readyState) > -1) { // (1)
        return "";
      }
      if (scope.error) { // (2)
        return "";
      }
      return stringifyResponseHeaders(scope.responseHeaders); // (3)
    };
  };

  var stringifyResponseHeaders = function(headers) {
    var string = [];
    var forbiddenHeaders = ["set-cookie", "set-cookie2", "status"];
    for (var key in headers) {
      if (forbiddenHeaders.indexOf(key.toLowerCase()) < 0) {
        string.push(key + ": " + headers[key]);
      }
    }
    return string.join("\n");
  };

  // -----------------------------------------------------------------
  // Event handler

  var stateChangeHandler = function(e, xhr, scope) { // #infrastructure-for-the-send()-method
    // Note: we supply lengthComputable, loaded and total only with the "progress" event types
    switch (e.state) {
      case "headers":
        scope.readyState = xhr.HEADERS_RECEIVED;
        scope.status = e.code;
        scope.statusText = e.message;
        scope.responseHeaders = e.headers;
        dispatchXHREvent("readystatechange", xhr);
        scope.uploadComplete = true; // #make-upload-progress-notifications
        dispatchFinishedProgressEvents(xhr.upload);
        break;
      case "loading":
        scope.readyState = xhr.LOADING;
        dispatchXHREvent("readystatechange", xhr);
        break;
      case "finished":
        // TODO create response based on responseType
        scope.responseText = e.response;
        scope.readyState = xhr.DONE;
        dispatchXHREvent("readystatechange", xhr);
        dispatchFinishedProgressEvents(xhr);
        dispatchFinishedProgressEvents(xhr.upload);
        scope.proxy.dispose();
        scope.proxy = null;
        break;
      case "error":
        handleRequestError("error", xhr, scope);
        break;
      case "timeout":
        handleRequestError("timeout", xhr, scope);
        break;
      case "abort":
        handleRequestError("abort", xhr, scope);
        break;
    }
  };

  var handleRequestError = function(event, xhr, scope) { // #request-error
    scope.error = true; // (1*) (#terminate-the-request)
    scope.readyState = xhr.DONE; // (1)
    // (2): superfluous as we don't support synchronous requests
    dispatchXHREvent("readystatechange", xhr); // (3)
    dispatchErrorProgressEvents(event, xhr);
    if (!scope.uploadComplete) {
      scope.uploadComplete = true;
      dispatchErrorProgressEvents(event, xhr.upload);
    }
    scope.proxy.dispose();
    scope.proxy = null;
  };

  // -----------------------------------------------------------------
  // Validators

  var validateRequiredOpenArgs = function(method, url) {
    if (!method) {
      throw new TypeError("Method argument should be specified to execute 'open'");
    }
    if (!url) {
      throw new TypeError("URL argument should be specified to execute 'open'");
    }
    validateMethod(method);
    // TODO: URL validation commented out as Rhino crashes with an OOM-error with several URLs
    // validateUrl(url);
  };

  var validateMethod = function(method) {
    if (!validHttpToken(method)) {
      throw new TypeError("Invalid HTTP method, failed to execute 'open'");
    }
    // (6):
    var tokens = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT", "TRACE", "TRACK"];
    var uppercaseMethod = method.toUpperCase();
    if (tokens.indexOf(uppercaseMethod) >= 0) {
      method = uppercaseMethod;
    }
    var forbiddenTokens = ["CONNECT", "TRACE", "TRACK"]; // (7)
    if (forbiddenTokens.indexOf(method) >= 0) {
      throw new Error(
              "SecurityError: '" + method + "' HTTP method is not secure, failed to execute 'open'"
      );
    }
  };

  var validHttpToken = function(httpToken) {
    // RFC-compliant validation for HTTP tokens ported from Chromium:
    // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
    var forbiddenCharacters = ["(", ")", "<", ">", "@", ",", ";", ":", "\\", "\"", "\/", "[", "]",
        "?", "=", "{", "}"];
    return !(/[^\x21-\x7E]/.test(httpToken) || forbiddenCharacters.indexOf(httpToken) >= 0);
  };

  var isValidHttpHeaderValue = function(value) {
    // non-RFC compliant validation for HTTP header values ported from Chromium:
    // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
    // Regex for Latin-1 characters only: https://gist.github.com/LeoDutra/3044325
    return !(!(/[*A-z\u00C0-\u00ff]+/g).test(value) || value.indexOf("\n") > -1 ||
        value.indexOf("\r") > -1);
  };

  var isForbiddenHeader = function(header) {
    return forbiddenHeaders.indexOf(header.toLowerCase()) > -1;
  };

  // URL validation commented out as Rhino crashes with an OOM-error with several URLs
  // var validateUrl = function(url) {
  //   // TODO: rewrite (8),(9)
  //   // taken from https://gist.github.com/dperini/729294
  //   if(!urlValidationRegex.test(url)){
  //     throw new SyntaxError("Malformed URI, failed to execute 'open'");
  //   }
  // };

  var forbiddenHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "date",
    "dnt",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
  ];

  // URL validation commented out as Rhino crashes with an OOM-error with several URLs
  // Taken from https://gist.github.com/dperini/729294
  // TODO: add to copyright header
  // var urlValidationRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;

  // -----------------------------------------------------------------
  // Event dispatcher

  var dispatchProgressEvent = function(type, target, lengthComputable, loaded, total) {
    target.dispatchEvent(initXhrProgressEvent(type, target, lengthComputable, loaded, total));
  };

  var dispatchAbortProgressEvents = function(context) {
    dispatchProgressEvent("progress", context);
    dispatchProgressEvent("abort", context);
    dispatchProgressEvent("loadend", context);
  };

  var dispatchErrorProgressEvents = function(event, context) {
    dispatchProgressEvent("progress", context);
    dispatchProgressEvent(event, context);
    dispatchProgressEvent("loadend", context);
  };

  var dispatchFinishedProgressEvents = function(context) {
    // Note: progress event is dispatched separately by the DownloadProgress/UploadProgress callbacks
    dispatchProgressEvent("load", context);
    dispatchProgressEvent("loadend", context);
  };

  var initXhrProgressEvent = function(type, target, lengthComputable, loaded, total) {
    var xhrProgressEvent = new tabris.XMLHttpRequestProgressEvent(type);
    xhrProgressEvent.currentTarget = xhrProgressEvent.target = target;
    if (lengthComputable) {
      xhrProgressEvent.lengthComputable = lengthComputable;
    }
    if (loaded) {
      xhrProgressEvent.loaded = loaded;
    }
    if (total) {
      xhrProgressEvent.total = total;
    }
    return xhrProgressEvent;
  };

  var dispatchXHREvent = function(type, target) {
    var xhrEvent = initXhrEvent(type, target);
    target.dispatchEvent(xhrEvent);
  };

  var initXhrEvent = function(type, target) {
    var xhrEvent = new tabris.DOMEvent(type);
    xhrEvent.currentTarget = xhrEvent.target = target;
    return xhrEvent;
  };

  // -----------------------------------------------------------------
  // Export

  if (typeof XMLHttpRequest === "undefined") {
    window.XMLHttpRequest = tabris.XMLHttpRequest;
    window.XMLHttpRequestProgressEvent = tabris.XMLHttpRequestProgressEvent;
  }

})();
