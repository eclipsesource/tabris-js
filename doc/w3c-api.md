# W3C APIs

Tabris implements a subset of popular W3C standards. Besides providing web developers with familiar APIs, this also enables you to use libraries developed for a browser environment.

## window object

In JavaScript there is always an object that represents the global scope. All global variables are members of this object. As in a web browser, this object is named `window` in Tabris.js. For example, the tabris object can be accessed either via `tabris` or `window.tabris`.

## console object

As in the browser, messages can be logged to the [developer console](getting-started#the-developer-console) using the global `console` object:

```js
console.log("A log message");
console.error("An error Message");
console.warn("A warning message");
console.info("An info message");
console.debug("A debug Message");
```

Calling `console.error` will also cause a message to pop up (even if the developer console is closed), but it won't interrupt script execution.

## Timer

Tabris supports the timer methods `setTimeout`, `setInterval`, `clearTimeout` and `clearInterval`. See [window](api/window.md).

See [W3C](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#timers) / [MDN](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Timers)

## XMLHttpRequest

Tabris supports the `XMLHttpRequest` to make HTTP request and to read resources that are part of the application.

See [W3C](http://www.w3.org/TR/XMLHttpRequest/) / [MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

*Tabris.js specifics:*

* Only asynchronous requests are supported. Attempting a synchronous request will cause an error.
* When a relative URL is given, Tabris.js will interpret it as a path relative to the application's `package.json`. This allows you to read static resources (files residing in your project folder).
* When using a custom built developer client, a relative URL may be used to access local files (bundled with the client as a resource) as well as those residing in the remote project folder (from which the code is loaded via HTTP). Local files take precedence.
* To enable access to SSL protected resources that use self signed certificates, use the `UseStrictSSL` preference in the config.xml. See the [Cordova documentation](cordova.md#preferences).

## Fetch

As a more powerful and flexible alternative to XHR, you can also use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
As of Tabris.js 1.7, an implementation of this API is included.

> <img align="left" src="img/note.png"> <i>To load static resources, working with URLs relative to the current [module](modules.md) may be more convenient. In the case of a JSON file, this can be done simply by using the `require` method instead of XHR. For other types of files, use the `__dirname` variable, e.g. `xhr.open("GET", __dirname + "/foo.txt");`.</i>

## WebSocket

WebSockets are an advanced technology that makes it possible to open an interactive communication session between the user's client and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply.

As of Tabris.js 1.10, an implementation of this API is included.

> The Tabris.js implementation supports to send and receive text messages as well as binary data in the form of `TypedArray` and `ArrayBuffer`. We currently do not support to receive data as `Blob`.

Further documentation:

* https://tools.ietf.org/html/rfc6455
* https://html.spec.whatwg.org/multipage/comms.html#websocket

## Persistent Storage

Tabris supports the global object `localStorage`, which allows storing key-value pairs in a persistent store. Both keys and values are stored as strings.

On iOS, there is an additional object `secureStorage` available in the global scope. This is a drop-in replacement for `localStorage` that keeps data in the encrypted iOS Keychain.

See [W3C](http://dev.w3.org/html5/webstorage/) / [MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage)

*Tabris.js specifics:*

* Currently, `localStorage` and `secureStorage` support the methods `setItem`, `getItem`, `removeItem`, and `clear`.
* The `sessionStorage` is not supported, as it would serve no purpose in a non-browser environment.
* The storage event is currently not supported.

> <img align="left" src="img/note.png"> <i>The `localStorage` is only meant to store relatively short strings. To store larger amounts of data it is recommended to use the cordova [`FileSystem`](https://www.npmjs.com/package/cordova-plugin-file) plugin.</i>

## Canvas Context

The `Canvas` widget provides an HTML5 canvas compatible "2D Context" object. See [Canvas](api/Canvas.md).

See [W3C](http://www.w3.org/TR/2dcontext/) / [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D)

## Random Source (Crypto)

The global object `crypto` provides an implementation of the [RandomSource](https://developer.mozilla.org/en/docs/Web/API/RandomSource) interface. It can be used to generate cryptographically secure random numbers.

See [W3C](https://dvcs.w3.org/hg/webcrypto-api/raw-file/tip/spec/Overview.html#crypto-interface) / [MDN](https://developer.mozilla.org/en/docs/Web/API/RandomSource/getRandomValues)
