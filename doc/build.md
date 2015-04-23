# Building a Tabris.js app

Tabris.js utilizes [Apache Cordova](http://cordova.apache.org) to build and package apps. This means you can configure your app the same way you would configure a Cordova application. Apps can be built without the need of any setup using the Tabris.js Online Build. To build an app locally you need to setup developer tools like Xcode or the Android SDK on your machine. The following features are supported by the two different build types.

|                           | Online Build | Local Build |
| :------------------------ |:---------------:| :---------------: |
| Building iOS Apps         |       ✓         |       ✓      |
| Building Android Apps     |       ✓         |       ✓      |
| [Integrate Cordova Plugins](cordova.md)     |       ✓      |       ✓      |
| [Cordova Build Hooks](https://github.com/apache/cordova-app-hello-world/blob/master/hooks/README.md)       |       ✓      |       ✓      |
| Custom Project Structure  |       ✓      |       ✓      |
| Own Build Scripts         |              |       ✓      |
| Using own build hardware  |              |       ✓      |
| Other SCMs than Git       |              |       ✓      |

> **Please Note:** To build an app locally you need a [tabrisjs.com pro account](https://tabrisjs.com/pricing/).

## The config.xml
It doesn't matter if you are building online or using a local build, the one thing you need at a minimum is a `config.xml` file that describes your app. The `config.xml` contains information like the id of your app, its version, icons and splash screens. The format of the `config.xml` needs to be the same as a standard [Cordova config.xml](https://cordova.apache.org/docs/en/4.0.0/config_ref_index.md.html#The%20config.xml%20File) file. A minimal example looks like this:

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

## Basic Project Layout
To be able to build a Tabris.js app your project needs to have the [layout of a standard Cordova application](https://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface_create_the_app). This means a `config.xml` is required at the root of your project. Besides this a `www` folder must exist which contains your actual Tabris.js app.
```
/
|- config.xml
|- www
    |-- package.json
    |-- app.js
```
While this layout is simple and fits well for mobile web-apps you might feel not so comfortable using this layout when doing native mobile apps using Tabris.js.

## Preferred Project Layout
Besides the standard Cordova layout the online build supports another project layout. This kind of layout allows to have all the Cordova stuff aside from your actual application. The only thing you need to do is creating a `cordova` directory in the root of your project and placing the `config.xml` in it. A project using this layout might look like this:
```
/
|- cordova
    |-- config.xml
|- package.json
|- app.js
|- .tabrisignore
```
For Tabris.js applications this layout feels more natural because they are no mobile web-apps and don't need a `www` directory.

> This layout is also the preferred and recommended one!

As you might have noticed in the layout example above is another file called `.tabrisignore`. This file contains entries that should not be included in your packaged app. E.g. if you want to exclude a `README` file you need to add it to the `.tabrisignore`. The format of this ignore file needs to be conform with the [`.gitignore`](http://git-scm.com/docs/gitignore) rules.

> **Please Note:** When using a local build you can use any project layout you want. But to build an app it needs to have the standard Cordova layout. The reason why the online build supports an alternative structure is because it transforms your project into the standard Cordova layout before it starts building it.

## Online Build
[Tabrisjs.com](https://tabrisjs.com) offers a free online build for Tabris.js apps. After signing in you can create an app in the "My Apps" section by clicking "Create App". Now you can select your GitHub repository in the list of repositories (if it’s not visible you may need to press the "synchronize" button). Users on the [Developer plan](https://tabrisjs.com/pricing/) can also use self hosted Git repositories.
![Create an App](img/build-create-app.png)
After you have selected your repository it’s going to be validated. The validation checks if the selected repository contains a valid Tabris.js [project layout](build.md#preferred-project-layout). If you have a valid project structure and `config.xml`, your app should become valid shortly. If it’s invalid, the site will tell you what went wrong. In this case please follow the instructions displayed.
![Valid App](img/build-valid-app.png)
After your app has become valid, you are ready to execute the first build. Just select the newly created app and click the "Start Android Build" button. A few minutes later you will get an Android .apk file which is ready to be installed on your device. But what about iOS, production builds and signing? All these things can be configured using the "Settings".

> **Please Note:** The online build does execute `npm install` within your app. As a result there is not need to put the `node_modules` folder under version control.

### Settings
![App Settings](img/build-app-settings.png)

* **Repository URL:** This is the URL pointing to your repository. In your case it should point to your GitHub repository. Users who are on the [Developer plan](https://tabrisjs.com/pricing/) can also use private GitHub repositories and custom repository locations.
* **SSH Private Key:** The SSH private key to use when cloning your repository. Only relevant if you have the developer plan and using a custom git repository URL which is not hosted on GitHub.
* **Branch:** The git branch to build from. The default value of this is `master`. But sometimes you may also want to build a feature branch or something similar. So, go ahead and configure it here.
* **App Directory:** The App Directory is the directory within your repository that contains your Tabris.js app. The value must be relative to the repository root.
* **iOS Signing Key:** iOS apps can not be deployed to a mobile device without being signed. If you want to build an iOS app you need an Apple Developer account and provide the certificate together with the provisioning profile. A very good tutorial how to get these files can be found in the [Phonegap Build documentation](http://docs.build.phonegap.com/en_US/signing_signing-ios.md.html#iOS%20Signing).
* **Android Signing Key:** Android apps needs to be signed with a certificate only if you want to deploy them to Google Play. If this is the case you can find a very good tutorial in the [Phonegap Build documentation](http://docs.build.phonegap.com/en_US/signing_signing-android.md.html#Android%20Signing) as well.
* **Tabris.js Version:** This is the Tabris.js version the app should use. In your `package.json` you have configured a dependency to "tabris" using a version e.g. "^1.0.0". This will load the Tabris.js npm module and provide the JavaScript APIs. The Tabris.js version that can be configured here is the "client version". This means the native parts that will interpret your JavaScript code are also available in different versions like the JavaScript API. In most cases the value "latest" is good enough here. But if you want to stick to a fixed Tabris.js version you can configure it here.
* **Debug:** The debug flag tells the build service which "flavor" of the app should be built. Debug `ON` means your app will be built including debug symbols and it will be packaged into the Tabris.js developer app to make development easier. This allows you to use all the benefits like the developer console or the reload also with your own app. Please be aware that debug versions can not be submitted to the app stores. Debug `OFF` means your app will be built to be ready for release. No developer app, no console, no reload! The only thing that gets executed is your JavaScript code.

### Plugins
To add any set of Apache Cordova Plugins the only thing you need to do is to change the `config.xml`. The online build supports the [`<gap:plugin />`](http://docs.build.phonegap.com/en_US/configuring_plugins.md.html#Plugins) tag as you might know it from Phonegap Build. This means you can add the plugins using an ID, HTTP or git URL. A sample `config.xml` including two Cordova plugins can look like this:
```xml
<?xml version='1.0' encoding='utf-8'?>
<widget
    id="my.first.app"
    version="1.0.0"
    xmlns:gap="http://phonegap.com/ns/1.0"
    xmlns="http://www.w3.org/ns/widgets"
    xmlns:cdv="http://cordova.apache.org/ns/1.0">
    ...
    <gap:plugin name="org.apache.cordova.camera" />
    <gap:plugin name="org.apache.cordova.dialogs" />
</widget>
```
> **Please Note:** If not already included like in the examples above, you also need to add the gap XML namespace in the root element of your `config.xml` file.

## Local Build
As mentioned before Tabris.js apps are built using [Apache Cordova](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface). If you are targeting iOS you will need  MacOS, while Android apps can be build on any OS that the Android SDK supports.

### Creating a Cordova project
First of all you need a Cordova installation. Follow the [Cordova Installation Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_installing_the_cordova_cli) and install the latest Cordova version on your system.

After the installation is completed you can create your app. This can be done using the `cordova create` command as it is described in the [Cordova CLI Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_create_the_app). After creating the project you will have a typical Cordova project layout including the `www` directory. The default content which was created automatically is not needed and can be deleted.

### Adding Tabris.js platforms
Tabris.js ships two custom Cordova platforms. This includes platforms for iOS and Android. Visit the [Tabris.js download page](https://tabrisjs.com/download) and download the platform of your choice.

> **Please Note:** Local builds are a [Pro feature](https://tabrisjs.com/pricing/). If you don't see the download you are probably not on a Pro plan.

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
To run an app you can use the `cordova run` command as it is described in the [Cordova Emulator and Device Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_test_the_app_on_an_emulator_or_device).

Building an app is also as simple as running one. You can use the `cordova build` command as it is described in the [Cordova Build Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface_build_the_app).

## Configuration
You can configure your application using the `config.xml` file as it is described in the [Cordova config.xml Guide](http://cordova.apache.org/docs/en/edge/config_ref_index.md.html#The%20config.xml%20File). It does not matter if you are using the online or local build.

Tabris.js also make use of the following modified/additional attributes:

### content
The optional `<content>` element defines the app's starting page in ordinary Cordova apps. In Tabris.js you can use it to define the location of the `package.json` file within the `www` folder. E.g. `<content src="mySubFolder/package.json"/>`

### preferences
Tabris.js accepts the following custom preferences:

| Name                   | Allowed Values | Default Value | Description |
|------------------------|----------------|---------------|-------------|
| EnableDeveloperConsole | true/false     | false         | Enables/Disables the [Tabris.js Developer Console](getting-started.md#the-developer-console).             |
| UseStrictSSL           | true/false     | true          | Activate/Deactivate ssl certificate validation on [XHR](w3c-api.md#xmlhttprequest). When disabled self signed ssl certificates are accepted. Should be enabled in production. |

### Android specific preferences

| Name                    | Value |
|-------------------------|-------|
| Theme                   | <ul><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris`</li><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris_Light`</li><li>`com.eclipsesource.tabris.android.R.style.Theme_Tabris_Light_DarkActionBar` (Default)</ul>In addition to these three bundled themes, a reference to any other Android theme can be specified (must be a fully qualified name). |
