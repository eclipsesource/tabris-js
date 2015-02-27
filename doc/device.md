# Device Information

The object `tabris.device` provides information about the device that executes the application. This object supports the following properties and events:

## Properties

All properties are read-only.

- `platform`: a name of the platform. Currently either "Android" or "iOS".
- `version`: the platform version as string. On iOS, that's something like "8.1.1". On Android, the [version code](https://developer.android.com/reference/android/os/Build.VERSION_CODES.html) is returned.
- `model`: the name of the model. Examples include "iPad4,1" and "Nexus 7".
- `language`: the user language configured on the device as an [RFC 4646](http://tools.ietf.org/html/rfc4646) compliant string. Examples include "de", "es-ES", etc.
- `screenWidth`: the entire width of the device's screen in device independent pixel. Depends on the current device orientation. For compatibility with Web libraries, this property is also available as [window.screen.width](https://developer.mozilla.org/en-US/docs/Web/API/Screen.width).
- `screenHeight`: the entire height of the device's screen in device independent pixel. Depends on the current device orientation. For compatibility with Web libraries, this property is also available as [window.screen.height](https://developer.mozilla.org/en-US/docs/Web/API/Screen.height).
- `scaleFactor`: the ratio between physical pixels and device independent pixels. Equivalent to [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window.devicePixelRatio) which is provided for compatibility with Web libraries.
- `orientation`: the device orientation. One of `portrait-primary`, `portrait-secondary`, `landscape-primary`, and `landscape-secondary`.

## Events

- `change:orientation`: fired when the `orientation` property has changed and the rotation animation has finished. The event object field `value` contains the new orientation.

## Example:

```js
var lang = tabris.device.get("language");

tabris.device.on("change:orientation", function(event) {
  console.log("new orientation:", event.value);
});
```
