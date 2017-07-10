---
---
# Custom Widgets

Custom widgets are written in JavaScript and the language available for the native platforms. They use the interfaces of the native Tabris.js clients and are wrapped in a Cordova plug-in. This article covers the JavaScript part of the implementation.

## Defining a Custom Widget in JavaScript

Custom widgets must extend `Widget`. It enables communication with the native part of the custom widget.

Custom widget classes must overwrite the `_nativeType` property getter to return a type matching the native implementation:

```js
class MyCustomWidget extends Widget {

  get _nativeType() {
    return 'myLibrary.MyCustomWidget';
  }

}
```

### Properties

Call `_nativeSet(name, value)` and `_nativeGet(name)` to exchange properties with the native client.

```js
class MyCustomWidget extends Widget {

  ...

  set myProperty(value) {
    this._nativeSet('myProperty', value);
  }

  get myProperty() {
    return this._nativeGet('myProperty');
  }

  ...

}
```

### Events

Overwrite the `_listen` method and call `_nativeListen` to get notified when an event gets fired by the native widget part.

```js
class MyCustomWidget extends Widget {

  ...

  _listen(name, listening) {
    if (name === 'myEvent') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  ...

}
```

### Compatibility with iOS 9

For compatibility with the JavaScriptCore version used in iOS 9, some ES6 language features must be transpiled (see [EcmaScript 6](lang.md#ecmascript-6)).
