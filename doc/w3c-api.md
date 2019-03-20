---
---
# W3C APIs

Tabris implements a subset of popular W3C standards. Besides providing web developers with familiar APIs, this also enables you to use libraries developed for a browser environment.

## window object

In JavaScript there is always an object that represents the global scope. All global variables are members of this object. For compatibility this object is available as `window`, but `global` is the actual global object in Tabris.js. For example, the tabris object can be accessed either via `tabris` or `global.tabris` or `window.tabris`.

## console object

As in the browser, messages can be logged to the [developer console](developer-app.md#the-developer-console) using the global `console` object:

```js
console.log("A log message");
console.warn("A warning message");
console.error("An error Message");
console.trace();
```

Calling `console.error` will also cause a message to pop up (even if the developer console is closed), but it won't interrupt script execution. See [Console](api/console.md).

## Timer

Tabris supports the timer methods `setTimeout`, `setInterval`, `clearTimeout` and `clearInterval`. See [timer](api/timer.md).

## Fetch

Tabris supports the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make HTTP request and to read resources that are part of the application.

When a relative URL is given, Tabris.js will interpret it as a path relative to the application's main `package.json`. This allows you to read static resources, i.e. the files residing in your project folder and not excluded via [`.tabrisignore`](./build.md#the-tabrisignore-file). You can also use URLs relative to the current [module](./modules.md) by using the `__dirname` variable, e.g. `fetch(__dirname + "/foo.txt");`.

> :point_right: To enable access to SSL protected resources that use self signed certificates add them to [`app.trustedCertificates`](./api/app.md). Alternatively you can disable the `UseStrictSSL` preference in the config.xml to accept all certificates. See [Building a Tabris.js App](build.md#preferences).

## XMLHttpRequest

Tabris also supports `XMLHttpRequest`, though `fetch()` is recommended for convenience.

See [W3C](http://www.w3.org/TR/XMLHttpRequest/) / [MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

> :point_right: Only asynchronous requests are supported in Tabris.js. Attempting a synchronous request will cause an error.

## WebSocket

WebSockets are an advanced technology that makes it possible to open an interactive communication session between the user's client and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply.

> The Tabris.js implementation supports to send and receive text messages as well as binary data in the form of `TypedArray` and `ArrayBuffer`, but not `Blob`.

See [W3C](https://www.w3.org/TR/websockets/) / [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## Worker

Workers are a simple mechanism to run a script in a background thread. The worker thread can perform tasks without interfering with the user interface. In addition, they can perform I/O using XMLHttpRequest or the file system api. Once created, a worker can send messages to the JavaScript code that created it by posting messages to an event handler specified by that code (and vice versa).

The tabris support for workers allows to send data to a running worker via the `worker.postMessage(data, transferList)` method. The `transferList` is ignored. The types supported in the data field are:

* `null`
* `undefined`
* `string`
* `number`
* `Boolean`
* `Object`
* `Array`
* `ImageData`
* `ArrayBuffer`
* `ArrayBufferView/TypedArray`

Only the following Tabris.js APIs can be used in a worker:

* localStorage
* App (Except: `restart()`, `close()` and `closeKeyboard()`)
* Crypto
* Device
* file system
* XHR/fetch
* TextEncoder
* WebSocket
* Worker

Widget APIs are unavailable. Calling any unsupported APIs has no effect.

See [W3C](https://www.w3.org/TR/workers/) / [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker)

## Persistent Storage

Tabris supports the global object `localStorage`, which allows storing key-value pairs in a persistent store. Both keys and values are stored as strings. See also [localStorage](./api/localStorage.md).

Note that the "storage" event is not supported. For debugging purposes the contents of the localStorage can be inspected using `console.dirxml()`[./api/console.md#dirxml]. On iOS, there is an additional object `secureStorage` available in the global scope. This is a drop-in replacement for `localStorage` that keeps data in the encrypted iOS Keychain.

> :point_right: The `localStorage` is only meant to store relatively short strings. To store larger amounts of data it is recommended to use the cordova [`FileSystem`](https://www.npmjs.com/package/cordova-plugin-file) plugin.

## Canvas Context

The `Canvas` widget provides an HTML5 canvas compatible "2D Context" object. See [Canvas](api/Canvas.md).

## Random Source (Crypto)

The global object `crypto` provides an implementation of the [RandomSource](https://developer.mozilla.org/en/docs/Web/API/RandomSource) interface. It can be used to generate cryptographically secure random numbers.

See [W3C](https://w3c.github.io/webcrypto/#crypto-interface) / [MDN](https://developer.mozilla.org/en/docs/Web/API/RandomSource/getRandomValues)
