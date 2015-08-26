# Cordova Plug-Ins Support
The Tabris.js API is primarily a UI/widget library, with some [additional browser-inspired APIs](w3c-api.md). To provide features not covered by either of these, Tabris.js can be extended with [Apache Cordova](http://cordova.apache.org/) plug-ins.

The JavaScript API documentation of a Cordova plug-ins is also valid in Tabris.js, with one minor exception: It is **not** necessary to listen to the `deviceready` event before accessing plug-in API. All plug-ins will be ready when the applications main module is loaded.

## Default Plug-Ins
While using the [Tabris.js Developer App](getting-started.md), your application can directly access the following pre-packaged plug-ins:

* [Badge](http://plugins.cordova.io/#/package/de.appplant.cordova.plugin.badge)
* [Camera](http://plugins.cordova.io/#/package/org.apache.cordova.camera)
* [Device Motion](http://plugins.cordova.io/#/package/org.apache.cordova.device-motion)
* [Dialogs](http://plugins.cordova.io/#/package/org.apache.cordova.dialogs)
* [Network Information](http://plugins.cordova.io/#/package/org.apache.cordova.network-information)
* [Toast](http://plugins.cordova.io/#/package/nl.x-services.plugins.toast)
* [Touch Id](http://plugins.cordova.io/#/package/io.monaca.touchid)
* [BarcodeScanner](http://plugins.cordova.io/#/package/com.phonegap.plugins.barcodescanner)
* [Google Analytics](http://plugins.cordova.io/#/package/com.cmackay.plugins.googleanalytics)
* [Google Play Services](http://plugins.cordova.io/#/package/com.google.playservices)

These plug-ins have tested with Tabris.js and a [demo](https://github.com/eclipsesource/tabris-js/tree/master/examples/cordova) can be found among the Tabris.js examples.

## Other Cordova Plug-Ins
To use Cordova Plug-Ins not part of the Tabris.js developer app you need to add them during the [build](build.md) process. You can either create a release-ready version of your own app, or a enhanced version of the developer app that contains the additional Plug-Ins (set *debug* mode to `ON`).

Most of the Plug-Ins will work out of the box but not all. This is because Tabris.js uses a **native UI** and **no HTML5**. As a result all Plug-Ins that manipulate the DOM will not work.

Plug-Ins that have been tested with Tabris.js are tracked as [GitHub issues](https://github.com/eclipsesource/tabris-js/issues?utf8=%E2%9C%93&q=label%3A%22compatibility+cordova%22). If the Plug-In is confirmed to work the issue is closed. Please feel free to add issues for Plug-Ins that you tested.
