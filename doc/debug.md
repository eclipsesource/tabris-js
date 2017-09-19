--
---
# Debugging Tabris.js

Tabris.js supports the `console.log`, `info`, `warn`, and `error` functions that are useful for debugging. The developer console also allows entering javascript commands at runtime. However, for more complex applications it is usually preferable to use a full-fledged debugger that lets you pause script execution and inspect variables.

## Android using Chrome Developer Tools

You can debug your app using the Chrome Developer Tools. Detailed Instructions by Google can also be found [here](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/).

Developer Machine Requirements:
* Windows, Linux or macOS
* [Google Chrome](https://www.google.com/chrome/browser/desktop/index.html)
* For Windows only, the [OEM USB driver of your Phone](https://developer.android.com/tools/extras/oem-usb.html).

Android Device Requirements:
* An installed Tabris.js app that has been built in debug mode, [either locally](./build.md#local-build) or via the [Tabris.js build service](./build.md#build-service).
* [USB Debugging Enabled](https://developer.android.com/studio/debug/dev-options.html)

How to Debug:
* Start the Tabris.js app.
* In Google Chrome enter `chrome://inspect/#devices`
* Connect your Android device via USB directly to the developer machine. Your device may ask you to allow USB debugging.
* The Android device and running Tabris app should appear in Chrome. Click "inspect"
* Go to the "Sources" tab and set a breakpoint.

If the Android Device does not show up in Chrome you can try disable and re-enable USB debugging on your device or switch between connecting it as a media device ("MTP") or Camera ("PTP"). It can take a few seconds for the device to appear in Chrome. If nothing else helps use the `adb` tool (part of the [Android SDK platform tools]((https://developer.android.com/studio/releases/platform-tools.html))) and run `adb devices` to make sure the device is detected.

In this state you are debugging the source code as it is bundled with the app. You can also use the developer console to load javascript files from your developer machine via `tabris serve`. That way you don't need to re-build the app for each change.

## iOS using Safari

Developer Machine Requirements:
* macOS
* Safari Browser, with the developer Menu enabled under "Safari -> Preferences -> Advanced".

iOS Device Requirements:
* An installed Tabris.js app that has been built in debug mode, [either locally](./build.md#local-build) or via the [Tabris.js build service](./build.md#build-service).
* Web Inspector enabled in "Settings -> Safari -> Advanced"

How to Debug:
* Connect your iOS device via USB directly to the developer machine.
* Start the Tabris.js app.
* In Safari go to "Develop -> \{name-of-your-device} -> \{name-of-your-app} -> JSContext" (If there are multiple entries, kill and restart the entire app)
* Go to the "Resources" tab and set a breakpoint.

In this state you are debugging the source code as it is bundled with the app. You can also use the developer console to load javascript files from your developer machine via `tabris serve`. That way you don't need to re-build the app for each change.

## Windows using Visual Studio

Developer Machine Requirements:
* Windows 10
* [Visual Studio 2017](https://www.visualstudio.com/de/downloads/)
* [Tabris CLI](https://tabrisjs.com/documentation/latest/getting-started.html#set-up-your-development-machine)

Target Device Requirements:
* Windows 10/Windows 10 Mobile (this may also be the developer machine)
* [Developer Mode Enabled](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development)

How to Debug:
* [Build your app locally](https://tabrisjs.com/documentation/latest/windows-support.html#building-an-app), for example:

`set VSINSTALLDIR=C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\&tabris build windows --debug -- --archs=x64`

* Open the resulting `{project-dir}\build\cordova\platforms\windows\CordovaApp.sln` file in Visual Studio
* Open the context menu of the Project "EclipseSource.Tabris.CordovaLauncher", go to "Properties -> Debug -> Debugger type ->" and set all fields to "Script".
* Add a breakpoint to your JavaScript code. You can find it in the "CordovaApp" project under "/www/app/".
* Start the app in the "Debug" configuration for the desired target and architecture (not "Any CPU").
* Once you encounter the breakpoint, a dialog may appear that will let you choose a debugger. Simply click "Yes".

In this state you are debugging the source code as it is bundled with the solution. Any changes on the copy or the original will have to be manually copied to the other. If you want to avoid this, do the following:

* Close the Solution
* In Windows Explorer, delete the contents of `{project-dir}\build\cordova\platforms\windows\www\app`
* Open a command prompt and navigate to this directory.
* Enter the following commands:

```
mklink package.json ..\..\..\..\..\..\package.json
mklink node_modules ..\..\..\..\..\..\node_modules /D
mklink src ..\..\..\..\..\..\src /D
```
Do this for all files and directories (using `/D`) needed at runtime by your app. Do _not_ link the entire project root.

* Re-open the solution.
* From the menu bar, choose `Build -> Clean Solution`.
* Launch the app.
