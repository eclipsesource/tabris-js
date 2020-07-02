---
---
# W3C and WHATWG APIs

Tabris implements a subset of popular W3C/WHATWG standards. Besides providing web developers with familiar APIs, this also enables you to use libraries developed for a browser environment. All APIs reside in the global namespace and do not have to be imported.

## window object

In JavaScript there is always an object that represents the global scope. All global variables are members of this object. For compatibility this object is available as `window`, but `global` is the actual global object in Tabris.js. For example, the tabris object can be accessed either via `tabris` or `global.tabris` or `window.tabris`.

## console object

The Tabris console object implements a subset of the WHATWG Console standard. As in the browser, messages can be logged to the [developer console](developer-app.md#the-developer-tools) with different methods indicating different log levels:

```js
console.log("A log message");
console.warn("A warning message");
console.error("An error Message");
console.trace();
```

Calling `console.error` will also cause a message to pop up (even if the developer console is closed), but it won't interrupt script execution. If the application is loaded via [`tabris serve`](./developer-app.md#code-sideloading) the output is also shown on the developer machine.


See also:
 * [Tabris API Documentation](api/console.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/console)
 * [WHATWG Standard](https://console.spec.whatwg.org/)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=console.jsx)

## Timer

Tabris supports the timer methods `setTimeout`, `setInterval`, `clearTimeout` and `clearInterval`. Passing strings to `setTimeout` or `setInterval` to evaluate is NOT supported.

See also:
 * [Tabris API Documentation](api/timer.md).
 * [`setTimeout` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)
 * [`setInterval` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval)
 * [WHATWG Standard](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=timer.jsx)

## Fetch

Tabris supports the `fetch()` function to make HTTP request and to read resources that are part of the application.

See also:
 * [Tabris API Documentation](api/fetch.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * [WHATWG Standard](https://fetch.spec.whatwg.org/)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=fetch.jsx)

## Blob

A blob represent raw data that may be created from various sources and can also be read into an `ArrayBuffer` or converted to a string. Blobs work with [fetch](#fetch), [XMLHttpRequest](#xmlhttprequest), [FileSystem](./api/fs.md#writefilepath-text-encoding) and [WebSocket](#websocket) APIs. Tabris does not support the `stream()` and `slice()` methods of `Blob`.

See also:
 * [Tabris API Documentation](api/Blob.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
 * [W3C Standard](https://w3c.github.io/FileAPI/#blob-section)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=imageview-blob.jsx)

## File

`File` is a subclass of [Blob](#blob) with additional `name` and `lastModified` fields. It is supported mainly to satisfy the [FormData](#formdata) standard.

See also:
 * [Tabris API Documentation](api/File.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/File)
 * [W3C Standard](https://w3c.github.io/FileAPI/)

## FormData

FormData can be used to send messages of the `multipart/form-data` MIME type via [`fetch()`](#fetch) or [`XMLHttpRequest`](#xmlhttprequest).

See also:
 * [Tabris API Documentation](api/FormData.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
 * [WHATWG Standard](https://xhr.spec.whatwg.org/#interface-formdata)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=formData.jsx)

## XMLHttpRequest

Tabris also supports `XMLHttpRequest`, though `fetch()` is recommended for convenience. Only asynchronous requests are supported in Tabris.js. Attempting a synchronous request will cause an error.

See also:
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
 * [WHATWG Standard](https://xhr.spec.whatwg.org/)
 * [<span class='language js'>JS</span>Example Snippet](https://playground.tabris.com/?snippet=xmlhttprequest.js)

## WebSocket

WebSockets are an advanced technology that makes it possible to open an interactive communication session between the user's client and a server. With this API, you can send messages to a server and receive event-driven responses without having to poll the server for a reply.

See also:
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 * [WHATWG Standard](https://html.spec.whatwg.org/multipage/web-sockets.html#the-websocket-interface)

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
* App (Except: `restart()`, `close()`, `closeKeyboard()` and `idleTimeoutEnabled`)
* Crypto
* Device
* file system
* XHR/fetch
* TextEncoder
* WebSocket
* Worker

Widget APIs are unavailable. Calling any unsupported APIs has no effect.

See also:
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * [WHATWG Standard](https://html.spec.whatwg.org/multipage/workers.html#worker)
 * [<span class='language js'>JS</span>Example Snippet](https://playground.tabris.com/?snippet=worker.js)

## Persistent Storage

Tabris supports the global object `localStorage`, which allows storing key-value pairs in a persistent store. Both keys and values are stored as strings.

Note that the "storage" event is not supported. For debugging purposes the contents of the localStorage can be inspected using `console.dirxml()`[./api/console.md#dirxml].

In addition to the `localStorage`, Tabris.js adds support for a `secureStorage` available in the global scope. This is a drop-in replacement for `localStorage` that keeps data encrypted using the Keychain on iOS and the AndroidKeyStore on Android.

> :point_right: The `localStorage` is only meant to store relatively short strings. To store larger amounts of data it is recommended to use the [`FileSystem`](./api/fs.md) api.

See also:
 * [Tabris API Documentation](api/localStorage.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
 * [WHATWG Standard](https://html.spec.whatwg.org/multipage/webstorage.html#the-storage-interface)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=local-storage.jsx)

## Canvas Context

The [Canvas](api/Canvas.md) widget provides a "2D Context" object that implements a subset of the HTML5 canvas.

See also:
 * [Tabris API Documentation](api/CanvasContext.md)
 * [MDN API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * [WHATWG Standard](https://html.spec.whatwg.org/multipage/canvas.html#2dcontext)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=canvas-shapes.jsx)

## Random Source (Crypto)

The global `crypto` object provides an implementation of the `RandomSource` interface that can be used to generate cryptographically secure random numbers.

See also:
 * [MDN API Documentation](https://developer.mozilla.org/en/docs/Web/API/RandomSource/getRandomValues)
 * [W3C Standard](https://w3c.github.io/webcrypto/#crypto-interface)
 * [<span class='language jsx'>JSX</span>Example Snippet](https://playground.tabris.com/?snippet=crypto.jsx)
