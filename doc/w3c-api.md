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

*Tabris.js notes:*

* Only asynchronous requests are supported. Attempting a synchronous request will cause an error.
* When a relative URL is given, Tabris.js will interpret it as a path relative to the application's `package.json`. This allows you to read static resources (files residing in your project folder).
* To read a JSON file, the `require` method may be more convenient to use (see [Modules](modules.md)).
* When using a custom built developer client, a relative URL may be used to access local files (bundled with the client as a resource) as well as those residing in the remote project folder (from which the code is loaded via HTTP). Local files take precedence.
* To enable access to SSL protected resources that use self signed certificates, use the `UseStrictSSL` preference in the config.xml. See the [Cordova documentation](cordova.md#preferences).

## Storage

Tabris supports the `localStorage` object, which allows storing simple key-value pairs.

*Tabris.js notes:*

* Currently the localStorage supports the methods `setItem`, `getItem`, `removeItem`, and `clear`.
* The `sessionStorage` is not supported, as it would serve no purpose in a non-browser environment.
* The storage event is currently not supported.
* The `localStorage` is only meant to store relatively short strings. To store larger amounts of data it is recommended to use the cordova [`FileSystem`](http://plugins.cordova.io/#/package/org.apache.cordova.file) plugin.

See [W3C](http://dev.w3.org/html5/webstorage/) / [MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage)

## Canvas Context

The `Canvas` widget provides an HTML5 canvas compatible "2D Context" object. See [Canvas](api/canvas.md).

See [W3C](http://www.w3.org/TR/2dcontext/) / [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D)

