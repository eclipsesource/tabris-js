## Local Build

You can build Tabris.js apps on your local machine using the [Cordova command line interface](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface).

> <img align="left" src="img/note.png"> <i>This guide is for building apps locally with the command line. A guide covering the online build service can be found [here](build.md).</i>

### Prerequisites

If you're targeting iOS you will need MacOS, while Android apps can be build on any OS that is supported by the Android SDK.

You also need a Cordova installation. Follow the [Cordova Installation Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_installing_the_cordova_cli) and install the latest Cordova version on your system.

The Cordova CLI expects a [standard directory layout](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface_create_the_app). That is, the `config.xml` is required at the root of the project and a `www` folder must exist which contains your actual Tabris.js app.
```
/
|- cordova/
    |- config.xml
    |- www
        |-- package.json
        |-- app.js
```

This directory structure can easily be created using the `cordova create` command as described in the [Cordova CLI Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_create_the_app). After creating the project you will have a typical Cordova project layout including the `www` directory. The default content which was created automatically is not needed and can be deleted.

### Adding Tabris.js platforms
Tabris.js ships two custom Cordova platforms. This includes platforms for iOS and Android. Visit the [Tabris.js download page](https://tabrisjs.com/download) and download the platform of your choice.

Extract the content of the downloaded archive and add the platform to your project using the `cordova platform add` command. You need to append the path to the download platform. E.g.:

```
cordova platform add /Users/Me/Downloads/tabris-ios
cordova platform add /Users/Me/Downloads/tabris-android
```
or for Windows users:
```
cordova platform add c:\MyDownloads\tabris-ios
cordova platform add c:\MyDownloads\tabris-android
```

### Integrate Cordova Plugins
You can integrate all available [Cordova Plugins](http://plugins.cordova.io/#/) using the `cordova plugin add` command. Read the [Cordova Plugin Installation Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_add_plugin_features) for a detailed description of this command.

An example of adding the [Cordova Camera Plugin](http://plugins.cordova.io/#/package/org.apache.cordova.camera) will result in this command:
```
cordova plugin add org.apache.cordova.camera
```

**Important:** You can install all available Cordova Plugins. Most of the Plugins will work out of the box but not all. This is because Tabris.js uses a **native UI** and **no HTML5**. As a result all Plugins that manipulate the DOM will not work.

### The Application Code
The code of a Cordova Application is placed in the `www` directory. This is where you need to place your Tabris.js project files (`package.json`, `node_modules` folder, and all your own modules and resources).

### Building/Running an App
To run an app, use the `cordova run` command as described in the [Cordova Emulator and Device Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_test_the_app_on_an_emulator_or_device).

Building an app is just as simple. Use the `cordova build` command as described in the [Cordova Build Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_build_the_app).

