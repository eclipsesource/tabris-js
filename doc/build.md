# Building a Tabris.js App

Tabris.js utilizes [Apache Cordova](http://cordova.apache.org) to build and package apps. Apps can be built without any local setup using the free online build service on tabrisjs.com. To [build an app on your local machine](local-build.md), you need to setup developer tools like Xcode or the Android SDK. The following features are supported by the two different build types.

|                           | Build Service | Local Build |
| :------------------------ |:---------------:| :---------------: |
| Building iOS Apps         |       ✓         |       ✓      |
| Building Android Apps     |       ✓         |       ✓      |
| [Integrate Cordova Plugins](cordova.md)     |       ✓      |       ✓      |
| [Cordova Build Hooks](https://github.com/apache/cordova-app-hello-world/blob/master/hooks/README.md)       |       ✓      |       ✓      |
| Custom Project Structure  |       ✓      |       ✓      |
| Own Build Scripts         |              |       ✓      |
| Using own build hardware  |              |       ✓      |
| Other SCMs than Git       |              |       ✓      |

> <img align="left" src="img/note.png"> <i>The online build service is free for public GitHub repositories. To built from a private repository, you need a [developer account](https://tabrisjs.com/pricing/). To build an app locally you need a [pro account](https://tabrisjs.com/pricing/). To build locally you need to follow the [local build guide](local-build.md).</i>

## Project Layout

To prepare your project for the build, you have to create a subdirectory named `cordova` that contains the build configuration. The layout of a Tabris.js project might look like this:
```
/
|- cordova/
    |- config.xml
|- src/
    |- <.js files>
|- test/
    |- <.spec.js files>
|- package.json
|- .tabrisignore
```

### The config.xml

The minimal build configuration you need is a `config.xml` file that describes your app. The `config.xml` contains information like the id of your app, its version, icons and splash screens. The format of the `config.xml` is the same as a standard [Cordova config.xml](https://cordova.apache.org/docs/en/4.0.0/config_ref_index.md.html#The%20config.xml%20File) file. A minimal example config could look like this:

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="my.first.app" version="1.0.0">
  <name>HelloWorld</name>
  <description>
    A sample Tabris.js application.
  </description>
  <author email="dev@tabrisjs.com" href="https://tabrisjs.com">
    Tabris.js Team
  </author>
</widget>
```

### The .tabrisignore file

The build service packages the contents of your project into the app. You can exclude certain files or directories that are not required in the packaged app, such as tests or developer documentation. Files and directories to be ignored by the build can be listed in a file named `.tabrisignore`. The format of this ignore file follows the same rules as a [`.gitignore`](http://git-scm.com/docs/gitignore) file.

> <img align="left" src="img/note.png"> <i>The .tabrisignore file is only relevant for the build service. In a local build, you have to manage the packaged files yourself (see below).</i>

## Build Service

[Tabrisjs.com](https://tabrisjs.com) offers a free online build service for Tabris.js apps. After signing in you can create an app in the "My Apps" section by clicking "Create App". Now you can select your GitHub repository in the list of repositories (if it’s not visible you may need to press the "synchronize" button). Users on the [Developer plan](https://tabrisjs.com/pricing/) can also use self hosted Git repositories.
![Create an App](img/build-create-app.png)
After you have selected your repository it’s going to be validated. The validation checks if the selected repository contains a valid Tabris.js [project layout](build.md#project-layout). If you have a valid project structure and `config.xml`, your app should become valid shortly. If it’s invalid, the site will tell you what went wrong. In this case please follow the instructions displayed.
![Valid App](img/build-valid-app.png)
After your app has become valid, you are ready to execute the first build. Just select the newly created app and click the "Start Android Build" button. A few minutes later you will get an Android .apk file which is ready to be installed on your device. But what about iOS, production builds and signing? All these things can be configured using the "Settings".

> <img align="left" src="img/note.png"> <i>The build service installs the dependencies specified in your package.json from npm (except devDependencies). As a result, you don't have to put the `node_modules` folder under version control.</i>

### Settings
![App Settings](img/build-app-settings.png)

* **Repository URL:** This is the URL of your git repository. If you're using the free build, it should point to a public GitHub repository. Users who are on the [Developer plan](https://tabrisjs.com/pricing/) can also use private GitHub repositories and custom repository locations.
* **SSH Private Key:** A SSH private key to access your repository. Only relevant for git repositories which are not hosted on GitHub.
* **Branch:** The git branch to build from. The default value is `master`. If you want to build from a feature branch, you may specify the branch here.
* **App Directory:** The directory within your repository that contains your Tabris.js app. The value must be relative to the repository root.
* **iOS Signing Key:** iOS apps can not be deployed to a mobile device without being signed. If you want to build an iOS app you need an Apple Developer account and provide the certificate together with the provisioning profile. A very good tutorial on how to get these files can be found in the [Phonegap Build documentation](http://docs.build.phonegap.com/en_US/signing_signing-ios.md.html#iOS%20Signing).
* **Android Signing Key:** Android apps needs to be signed with a certificate only if you want to deploy them to Google Play. You can find a very good tutorial in the [Phonegap Build documentation](http://docs.build.phonegap.com/en_US/signing_signing-android.md.html#Android%20Signing) as well.
* **Environment Variables:** Key/Value pairs that will be stored and transferred encrypted to the build machines. They can be used within the config.xml or custom hooks. Use cases are adding plugins from private git repositories or handling access keys.
* **Builds to keep:** Specifies the number of builds that should be kept before deleting them automatically.
* **Tabris.js Version:** The Tabris.js *client* version to use in the app. In contrast to the "tabris" dependency to your `package.json` which defines the version of the JavaScript module, this setting defines the version of the native client that will interpret your JavaScript code. In most cases, the value `latest` is good enough here. But if you want to stick to a fixed Tabris.js version you can configure it here.
* **Debug:** Enables the *debug mode*. If set to `ON`, your app will be built including debug symbols and it will be packaged into the Tabris.js developer app to make development easier. This allows you to use all the benefits like the developer console or the reload also with your own app. Please be aware that debug versions can not be submitted to the app stores. Debug `OFF` means your app will be built to be ready for release: no developer app, no console, no reload. Only your JavaScript code is executed.

### Adding Plugins
To add a set of Apache Cordova Plugins you only need to add them to the `config.xml`. The online build supports the Cordova `<plugin />` tag. This tag allows you to add plugins using an ID, an HTTP or a git URL. A sample `config.xml` including two Cordova plugins could look like this:
```xml
<?xml version='1.0' encoding='utf-8'?>
<widget
    id="my.first.app"
    version="1.0.0"
    xmlns="http://www.w3.org/ns/widgets"
    xmlns:cdv="http://cordova.apache.org/ns/1.0">
    ...
  <plugin name="cordova-plugin-camera" version="1.2.0" />
  <plugin name="cordova-plugin-dialogs" version="1.1.1" />
</widget>
```

## Configuration

In addition to the settings described in the [Cordova config.xml Guide](http://cordova.apache.org/docs/en/edge/config_ref_index.md.html#The%20config.xml%20File), Tabris.js also takes the following modified/additional `config.xml` attributes into account. These attributes apply to both, the online and the local build.

### content
The optional `<content>` element defines the app's starting page in ordinary Cordova apps. In Tabris.js you can use it to define the location of the `package.json` file within the `www` folder. E.g. `<content src="mySubFolder/package.json"/>`

### preferences
Tabris.js accepts the following custom preferences:

| Name                   | Allowed Values | Default Value | Description |
|------------------------|----------------|---------------|-------------|
| EnableDeveloperConsole | true/false     | false         | Enables/Disables the [Tabris.js Developer Console](getting-started.md#the-developer-console).             |
| UseStrictSSL           | true/false     | true          | Activate/Deactivate SSL certificate validation on [XHR](w3c-api.md#xmlhttprequest). When disabled self signed SSL certificates are accepted. Should be enabled in production. |

### Android specific preferences

| Name                    | Value |
|-------------------------|-------|
| Theme                   | <ul><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris`</li><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris_Light`</li><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris_Light_DarkActionBar` (Default)</ul> In addition to these three bundled themes, a reference to any other Android theme can be specified (must be a fully qualified name). |
