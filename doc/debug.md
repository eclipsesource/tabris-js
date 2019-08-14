---
---
# Debugging Tabris.js

Tabris.js provides a global [`console`](./api/console.md) object with various useful logging functions including `console.trace()`. The [developer console](./developer-app.md#the-developer-console) also allows entering javascript commands at runtime, as does the CLI using the `-i` switch, e.g. `tabris serve -i`. Since the tabris module exports are available as a global object the application state can be inspected. For example:

Print the app version:
```
console.log(tabris.app.version);
```

Print main UI tree:
```
console.dirxml(tabris.contentView);
```

Inspect localStorage:
```
console.dirxml(localStorage);
```


However, for more complex applications it is sometimes requires to use a full-fledged debugger that lets you pause script execution.

## Android using Chrome Developer Tools

You can debug your app using the Chrome Developer Tools. Detailed Instructions by Google can also be found [here](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/).

### Developer Machine Requirements
* Windows, Linux or macOS
* [Google Chrome](https://www.google.com/chrome/browser/desktop/index.html)
* For Windows only, the [OEM USB driver of your Phone](https://developer.android.com/tools/extras/oem-usb.html).

### Android Device Requirements
* An installed Tabris.js app that has been built in debug mode, [either locally](./build.md#local-build) or via the [Tabris.js build service](./build.md#build-service).  The Tabris.js developer app from the app stores is not debuggable since the app is built in release mode.
* [USB Debugging Enabled](https://developer.android.com/studio/debug/dev-options.html)

### How to Debug
* Start the Tabris.js app.
* In Google Chrome enter `chrome://inspect/#devices`
* Connect your Android device via USB directly to the developer machine. Your device may ask you to allow USB debugging.
* The Android device and running Tabris app should appear in Chrome. Click "inspect"
* Go to the "Sources" tab and set a breakpoint.

If the Android Device does not show up in Chrome you can try disable and re-enable USB debugging on your device or switch between connecting it as a media device ("MTP") or Camera ("PTP"). It can take a few seconds for the device to appear in Chrome. If nothing else helps use the `adb` tool (part of the [Android SDK platform tools](https://developer.android.com/studio/releases/platform-tools.html))) and run `adb devices` to make sure the device is detected.


## iOS using Safari

### Developer Machine Requirements
* macOS
* Safari Browser, with the developer Menu enabled under "Safari -> Preferences -> Advanced".

### iOS Device Requirements
* An installed Tabris.js app that has been built in debug mode, [either locally](./build.md#local-build) or via the [Tabris.js build service](./build.md#build-service).
* Web Inspector enabled in "Settings -> Safari -> Advanced"

### How to Debug
* Connect your iOS device via USB directly to the developer machine.
* Start the Tabris.js app.
* In Safari go to "Develop -> \{name-of-your-device} -> \{name-of-your-app} -> JSContext" (If there are multiple entries, kill and restart the entire app)
* Go to the "Resources" tab and set a breakpoint.
