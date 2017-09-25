---
---
# Cordova Plug-ins Support

The Tabris.js API is primarily a UI/widget library, with some [additional browser-inspired APIs](w3c-api.md). To provide features not covered by either of these, Tabris.js can be extended with [Apache Cordova](http://cordova.apache.org/) plug-ins.

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

Please note, default plug-ins are only included in the debug version of an app. If you want to use them in the release version, you should add them via `<plugin>` tags in the Cordova `config.xml` file: [Integrating Cordova Plugins](build.md#integrating-cordova-plugins).

## Other Cordova plug-ins

To use Cordova plug-ins not part of the Tabris.js Developer App you need to add them during the [build](build.md) process. You can either create a release-ready version of your own app, or a enhanced version of the Developer App that contains the additional plug-ins (set *debug* mode to `ON`).

Since Tabris.js uses a **native UI** and **no HTML5**, most of the plug-ins will work out of the box but not all. Plug-ins that manipulate the DOM will not work.

Plug-ins that have been tested with Tabris.js are tracked as [GitHub issues](https://github.com/eclipsesource/tabris-js/issues?utf8=%E2%9C%93&q=label%3A%22compatibility+cordova%22). If the plug-in is confirmed to work the issue is closed. Please feel free to add issues for plug-ins that you tested.
