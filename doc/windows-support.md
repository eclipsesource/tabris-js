---
---
# Notes on Windows 10 Support

## Developer App

The developer app for Windows can run – without emulation or Windows SDK – on the same machine that you use for Tabris.js app development. When doing so you should know a few things:

1. The mouse does not always replace a touchscreen. Some gestures will not be recognized using mouse input. Owners of laptop/tablet hybrid devices have an advantage here.

2. The one-finger-edge-swipe gesture to open the developer console won’t work: That gesture is reserved by the OS to open the action center. As a replacement, you can use the mouse or a pen to do the gesture, use two finger to do it (may require more precision), or simply press F12 on your keyboard.

3. Loopback addresses (`localhost`, `127.0.0.1`) do not work out-of-the-box. To allow the developer app to access a tabris http-server running on the same machine, you need to enable it once using this command in an admin command prompt window:

`CheckNetIsolation.exe LoopbackExempt -a -p="S-1-15-2-2113086592-2161398931-2814723024-3165814665-986162242-220195364-2881192403"`


## API

Windows 10 (UWP/Store Apps) support was added after Android and iOS. For that reason, some APIs available on these platforms are not (yet) supported on Windows. Consult the API reference for details. Also, there are some new APIs specific to windows-ony features. These are prefixed with `win_` and also documented in the API reference.

## Building an App

For the tabris-CLI to find the correct Visual Studio version (2017) you need to set an environment variable `VSINSTALLDIR` with the path to the installation directory. For the Community Edition of Visual Studio this is usually `C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\`.

To avoid packaging problems (specific to the windows platform) during a [local build]((./build.md)) you should create packages for different CPU architecture separately, e.g.

```
tabris clean
tabris build windows --release -- --archs="<cpu>"
```

Where `<cpu>` can be 'x64', 'x86' or 'arm'. Copy the package in to a separate directory and repeat this step for the next architecture.

The windows-specific `config.xml` preferences are covered [here](./build.html#windows-specific-preferences).

> :point_right: The windows build is currently only creating packages for side-loading. For now, if you need to upload an app to the Windows store you have to make a local build and upload it via Visual Studio.


## Sideloading apps on Windows 10 (PC):

 - If not already done, put the PC in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.
 - You may have to install the certificate used to sign the app. Get the `.cer` or `.pfx` and double click it. Install it on "Local Computer" in the "Trusted Root Certification Authorities" group.
 - Now double click the `Add-AppDevPackage.ps1` file. This will start the installation.
 - After the installation is done the app will appear in the start menu.

> :point_right: The tabris build service currently always uses the cordova key to sign the app. In the future you will be able to use your own key to build Windows-Store-ready packages.


## Sideloading apps on Windows 10 (Mobile):

 - If not already done, put the phone in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.

Now there are two options. You may copy the `.appx` to your phone via USB and install it from there:
 - Move the `.appx` to your phone.
 - Find the file in the file explorer app.
 - Tap the app. Confirm that you want to install the app.
 - The app is installed in the background. Unfortunately you don't get any feedback when the process is done. The app should appear after a minute or so on the "all apps" screen.

The other option is to install the app from a Windows PC. This requires the Windows 10 SDK to be installed.
 - Attach the phone to your Windows PC using an USB cable.
 - Open a command prompt (`cmd.exe`).
 - Enter `"C:\Program Files (x86)\Windows Kits\10\bin\x86\WinAppDeployCmd.exe" devices`
 - Copy the GUID of your phone.
 - Enter `"C:\Program Files (x86)\Windows Kits\10\bin\x86\WinAppDeployCmd.exe" install -file "<path-to-your-appx>" -g <GUID-of-your-phone>`
