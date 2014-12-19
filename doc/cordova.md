# Including Cordova Plug-Ins

Tabris.js uses [Apache Cordova](http://cordova.apache.org/) plug-ins to access device functions. The following plug-ins are pre-installed in the Tabris.js developer app (version M6):

* [Badge](http://plugins.cordova.io/#/package/de.appplant.cordova.plugin.badge)
* [Camera](http://plugins.cordova.io/#/package/org.apache.cordova.camera)
* [Device Motion](http://plugins.cordova.io/#/package/org.apache.cordova.device-motion)
* [Dialogs](http://plugins.cordova.io/#/package/org.apache.cordova.dialogs)
* [File API](http://plugins.cordova.io/#/package/org.apache.cordova.file)
* [Network Information](http://plugins.cordova.io/#/package/org.apache.cordova.network-information)
* [Toast](http://plugins.cordova.io/#/package/nl.x-services.plugins.toast)
* [Touch Id](http://plugins.cordova.io/#/package/io.monaca.touchid)

In order to use them, your Tabris.js project currently requires a `platform` directory containing the JavaScript code of these plug-ins. You can either use the [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html) to create a Cordova project with the desired plug-ins and platforms, or simply download a prepared copy [here](https://tabrisjs.com/downloads/nightly/cordova-plugins.zip). The API of all plug-ins is explained in the links above, a demo can be found in the Tabris examples.

In the future, you will be able to build your own Tabris.js app including a custom set of Cordova plug-ins.
