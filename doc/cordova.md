# Cordova Support
Tabris.js has support for [Apache Cordova](http://cordova.apache.org/). This means you can integrate [Cordova Plugins](http://plugins.cordova.io/#/) and build apps using the [Cordova CLI](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface).

## Creating a project
First of all you need a Cordova installation. Follow the [Cordova Installation Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_installing_the_cordova_cli) and install the latest Cordova version on your system.

After the installation is completed you can create your first app. This can be done using the `cordova create` command as it is described in the [Cordova CLI Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_create_the_app). After creating the project you will have a typical Cordova project structure including the `www` directory. The default content which was created automatically is not needed and can be deleted.

## Adding tabris.js platforms
Tabris.js ships two custom Cordova platforms. This includes platforms for iOS and Android. Visit the [tabris.js download page](https://tabrisjs.com/downloads) and download the platform of your choice.

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

## Integrate Cordova Plug-Ins
You can integrate all available [Cordova Plugins](http://plugins.cordova.io/#/) using the `cordova plugin add` command. Read the [Cordova Plug-In Installation Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_add_plugin_features) for a detailed description of this command.

An example of adding the [Cordova Camera Plug-In](http://plugins.cordova.io/#/package/org.apache.cordova.camera) will result in this command:
```
cordova plugin add org.apache.cordova.camera
```

**Important:** You can install all available Cordova Plug-Ins. Most of the Plug-Ins will work out of the box but not all. This is because tabris.js uses a **native UI** and **no HTML5**. As a result all Plug-Ins that manipulate the DOM will not work.

## Default Plug-Ins in the Developer Apps
If you are using the [Tabris.js Developer Apps](https://tabrisjs.com/documentation/getting-started), your application can directly access the following pre-packaged plug-ins:

* [Badge](http://plugins.cordova.io/#/package/de.appplant.cordova.plugin.badge)
* [Camera](http://plugins.cordova.io/#/package/org.apache.cordova.camera)
* [Device Motion](http://plugins.cordova.io/#/package/org.apache.cordova.device-motion)
* [Dialogs](http://plugins.cordova.io/#/package/org.apache.cordova.dialogs)
* [File API](http://plugins.cordova.io/#/package/org.apache.cordova.file)
* [Network Information](http://plugins.cordova.io/#/package/org.apache.cordova.network-information)
* [Toast](http://plugins.cordova.io/#/package/nl.x-services.plugins.toast)
* [Touch Id](http://plugins.cordova.io/#/package/io.monaca.touchid)

## The Application Code
The code of a Cordova Application is placed in the `www` directory. When using the Cordova CLI for tabris.js the application code must also be in the `www` folder. This means your `package.json` file must be placed directly in the `www` folder.

To get an application quickly just copy one of the [examples](https://github.com/eclipsesource/tabris-js/tree/master/examples) into the `www` directory.

## Building/Running an App
To run an app you can use the `cordova run` command as it is described in the [Cordova Emulator and Device Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_test_the_app_on_an_emulator_or_device).

Building an app is also as simple as running one. You can use the `cordova build` command as it is described in the [Cordova Build Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_build_the_app).

## Configuration
You can configure the application using the `config.xml` file as it is described in the [Cordova config.xml Guide](http://cordova.apache.org/docs/en/edge/config_ref_index.md.html#The%20config.xml%20File).

Tabris.js also make use of the following modified/additional attributes:

### content
The optional `<content>` element defines the app's starting page in ordinary Cordova apps. In Tabris.js you can use it to define the location of the `package.json` file within the `www` folder. E.g. `<content src="mySubFolder/package.json"/>`

### preferences
Tabris.js accepts the following custom preferences:

| Name                   | Allowed Values | Default Value | Description |
|------------------------|----------------|---------------|-------------|
| EnableDeveloperConsole | true/false     | false         | Enables/Disables the [Tabris.js Developer Console](https://tabrisjs.com/documentation/getting-started#the-developer-console).             |
| UseStrictSSL           | true/false     | true          | Activate/Deactivate ssl certificate validation. When disabled self signed ssl certificates are accepted. Should be enabled in production. |

#### Android specific preferences

| Name                    | Value |
|-------------------------|-------|
| Theme                   | <ul><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris`</li><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris_Light`</li><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris_Light_DarkActionBar` (Default)</ul>In addition to these three bundled themes, a reference to any other Android theme can be specified (must be a fully qualified name). |
