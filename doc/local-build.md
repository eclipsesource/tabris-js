## Local Build

You can build Tabris.js apps on your local machine using the [Tabris CLI](https://www.npmjs.com/package/tabris-cli).

> <img align="left" src="img/note.png"> <i>This guide is for building apps locally with the command line. A guide covering the online build service can be found [here](build.md).</i>

### Prerequisites

If you're targeting iOS you will need MacOS, while Windows apps need a Windows PC with Visual Studio 2015.
Android apps can be build on any OS that is supported by the Android SDK.

The Tabris CLI should be installed globally on your system:

```
npm install -g tabris-cli
```

The Tabris CLI uses Cordova to build apps, so you also need a Cordova installation. Follow the [Cordova Installation Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_installing_the_cordova_cli) and install the latest Cordova version on your system.

### Downloading Tabris.js platforms

Tabris.js ships custom Cordova platforms for Android, iOS, and Windows. Visit the [Tabris.js download page](https://tabrisjs.com/download) and download the platform of your choice (make sure to sign in to Tabrisjs.com).

Extract the content of the downloaded archive and create an environment variable `TABRIS_ANDROID_PLATFORM`, `TABRIS_IOS_PLATFORM`, or `TABRIS_WINDOWS_PLATFORM`, respectively, that contains the path to the extracted folder.

### Configuration

To configure the app build, your project needs a directory `cordova` with a file `config.xml` file.
This file will be created when you initialized your project folder with `tabris init`.
For details please refer to the [Cordova documentation](https://cordova.apache.org/docs/en/latest/config_ref/index.html).

### Integrate Cordova Plugins

You can integrate all available [Cordova Plugins](http://plugins.cordova.io/#/) by including them in your `config.xml`.

For example, to add the [Cordova Camera Plugin](http://plugins.cordova.io/#/package/org.apache.cordova.camera), you'd add this line:

```
<plugin name="cordova-plugin-camera" spec="^2.3.0" />
```

**Important:** You can install all available Cordova Plugins. Most of the Plugins will work out of the box. However, since Tabris.js uses a **native UI** and **no HTML5**, plugins that rely on an HTML5 UI (i.e. the DOM) won't work.

### Excluding files and directories

You may want to exclude certain files and folders from your app. For example, if you use a transpiler, you may want to package only the transpiled code, but not your sources and test files. To exclude files and folders from the built app, add them to a file named `.tabrisignore`. The syntax for the file follows the `.gitignore` [spec](http://git-scm.com/docs/gitignore).

The following folders are excluded by default and don't have to be listed in the `.tabrisignore`:

* '.git/'
* 'node_modules/'
* 'build/'
* The file '.tabrisignore' itself

### Building an App

```
tabris build [android|ios|windows]
```

This command will first run the npm scripts `build` or `build:<plaform>`, if the exist in your `package.json`.

To build a Windows app signed with your own key, run
`cordova build windows --release -- --packageCertificateKeyFile="<absolute-path-to-pfx>" --bundle`
