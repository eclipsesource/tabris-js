---
---
# Custom Widgets

Custom widgets are Tabris.js widgets that are mainly written in the programming language of the native platforms they support. They use the interfaces of the native Tabris.js clients and are wrapped in a Cordova plug-in. This article covers the platform-independent JavaScript part of the implementation.

A custom widget is not a "Custom Component", which has no native code at all. A custom widget directly extends `tabris.Widget`, while custom components extend an existing widgets like `tabris.Composite`.

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
