---
---
# Cordova Plug-ins Support

The Tabris.js API is primarily a UI/widget library, with some [additional browser-inspired APIs](w3c-api.md). It is also compatible with many JavaScript libraries that do not require the DOM or native node modules. To provide features not covered by any of these, Tabris.js can be extended with [Apache Cordova](http://cordova.apache.org/) plug-ins. This is the recommended way to utilize platform-native features in Tabris.js.

The JavaScript API documentation of Cordova plug-ins is also valid in Tabris.js, with one minor exception: It is **not** necessary to listen to the `deviceready` event before accessing plug-in API. All plug-ins will be ready when the applications main module is loaded.

## Default Plug-Ins

While using the [Tabris.js Developer App](developer-app.md), your application can directly access the following pre-packaged plug-ins:

* [Badge](https://www.npmjs.com/package/de.appplant.cordova.plugin.badge)
* [Camera](https://www.npmjs.com/package/cordova-plugin-camera)
* [Device Motion](https://www.npmjs.com/package/cordova-plugin-device-motion)
* [Network Information](https://www.npmjs.com/package/cordova-plugin-network-information)
* [Toast](https://www.npmjs.com/package/cordova-plugin-x-toast)
* [BarcodeScanner](https://www.npmjs.com/package/phonegap-plugin-barcodescanner)
* [Google Analytics](https://www.npmjs.com/package/com.cmackay.plugins.googleanalytics)
* [Google Play Services](https://www.npmjs.com/package/cordova-plugin-googleplayservices)

These plug-ins have been tested with Tabris.js and a [demo](https://github.com/eclipsesource/tabris-js/tree/master/examples/cordova) can be found among the Tabris.js examples.

Please note, these default plug-ins are only part of the developer app published through the app stores, they are not automatically included when you are building your own app.

## Other Cordova plug-ins

Since Tabris.js uses a **native UI** and **no HTML**, most other plug-ins will work out of the box but not all. Plug-ins that manipulate the DOM will not work.

To use Cordova plug-ins not part of the Tabris.js [Developer App](./developer-app.md) you need to add them during the [build](build.md) process and install the resulting app on your device. You can still side-load code if you build the app in *debug* mode. To do so use the  `--debug` switch with the `tabris build` command or the "Debug" setting in the build service' "Settings" tab. This enables the [developer console](./developer-app.md#the-developer-console). (Assuming `EnableDeveloperConsole` is set to `$IS_DEBUG` in your `config.xml`.) The resulting app will then start with the source code from the git commit the built is based on, but the console allows you to load code via the CLI `serve` command.
