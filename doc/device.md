# Device Information

The global object `device` provides information about the device that executes the application. All fields are read-only.

- `device.platform`: a name of the platform. Currently either "Android" or "iOS".
- `device.version`: the platform version as string. On iOS, that's something like "8.1.1". On Android, the [version code](https://developer.android.com/reference/android/os/Build.VERSION_CODES.html) is returned.
- `device.model`: the name of the model. Examples include "iPad4,1" and "Nexus 7".
- `device.language`: the user langugage configured on the device as an [RFC 4646](http://tools.ietf.org/html/rfc4646) compliant string. Examples include "de", "es-ES", etc.
- `device.screen.width`: the entire width of the device's screen in device independent pixel. Depends on the current device orientation. For compatibility with Web libraries, this property is also available as [window.screen.width](https://developer.mozilla.org/en-US/docs/Web/API/Screen.width).
- `device.screen.height`: the entire height of the device's screen in device independent pixel. Depends on the current device orientation. For compatibility with Web libraries, this property is also available as [window.screen.height](https://developer.mozilla.org/en-US/docs/Web/API/Screen.height).
- `device.scaleFactor`: the ratio between physical pixels and device independent pixels. Equivalent to [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window.devicePixelRatio) which is provided for compatibility with Web libraries.
