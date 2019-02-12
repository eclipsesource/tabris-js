---
---
# Notes on Windows 10 Support

## Developer App

The developer app for Windows can run – without emulation or Windows SDK – on the same machine that you use for Tabris.js app development. When doing so you should know a few things:

1. The mouse does not always replace a touchscreen. Some gestures will not be recognized using mouse input. Owners of laptop/tablet hybrid devices have an advantage here.

2. The one-finger-edge-swipe gesture to open the developer console won’t work: That gesture is reserved by the OS to open the action center. As a replacement, you can use the mouse or a pen to do the gesture, use two finger to do it (may require more precision), or simply press F12 on your keyboard.

3. Loopback addresses (`localhost`, `127.0.0.1`) do not work out-of-the-box. To allow the developer app to access a Tabris http-server running on the same machine, you need to enable it once using this command in an admin command prompt window:

`CheckNetIsolation.exe LoopbackExempt -a -p="S-1-15-2-2113086592-2161398931-2814723024-3165814665-986162242-220195364-2881192403"`


## API

Windows 10 (UWP/Store Apps) support was added after Android and iOS. For that reason, some APIs available on these platforms are not (yet) supported on Windows. Consult the API reference for details. Also, there are some new APIs specific to windows-only features. These are prefixed with `win_` and also documented in the API reference.

## Building an App for Sideloading

For the Tabris CLI to find the correct Visual Studio version (2017) you need to set an environment variable `VSINSTALLDIR` with the path to the installation directory. For the Community Edition of Visual Studio this is usually `C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\`.

App packages for different CPU architecture need to be built separately, e.g.

```
tabris clean
tabris build windows --release --arch=<cpu>
```

Where `<cpu>` can be 'x64', 'x86' or 'arm'. Copy the package in to a separate directory and repeat this step for the next architecture.

The windows-specific `config.xml` preferences are covered [here](./build.html#windows-specific-preferences).

## Building an app for the Windows Store

The Tabris.js Windows build service can not sign packages for the Windows Store. If you need to upload an app to the Windows Store you have to make a local build. You can either create a signing key yourself and configure the Tabris CLI to use it, or pre-build the app using the CLI and then [use Visual Studio to create `.appxupload` packages](https://docs.microsoft.com/en-us/windows/uwp/packaging/packaging-uwp-apps#create-an-app-package).

### Manually generating a signing key (.pfx file)

1. First lookup the *publisher id*. When you create an App on the online Windows developer dashboard you can find it under "App Identity".
2. Create a `.cer` file valid for signing like this:
```
makecert.exe -n "<publisher-id>" -r -h 0 -eku "1.3.6.1.5.5.7.3.3,1.3.6.1.4.1.311.10.3.13" -e "01/01/2020" -sv MyKey.pvk MyKey.cer
```
3. Create a *pfx* file using: `pvk2pfx.exe -pvk MyKey.pvk -spc MyKey.cer  -pfx MyKey.pfx`.

Do not give any passwords when creating the key, otherwise they won't be useable by the CLI.

The files `makecert.exe` and `pvk2pfx` are part of the Windows 10 SDK and - when installed - can usually be found in: `C:\Program Files (x86)\Windows Kits\10\bin`. If you have Visual Studio installed you should already have these.

### Building for the Store

With the key properly created, you can now configure your app for the Windows Store.

1. Copy the key to the `cordova` directory of the App. You may want to exclude it from the repository using `.gitignore`.
2. In the windows platform section of your `config.xml` set your publisher name and identity.
```xml
  <platform name="windows">
    <preference name="WindowsStorePublisherName" value="<publisher-name>"/>
    <preference name="WindowsStoreIdentityName" value="<package-identity>"/>
  </platform>
```
Both can also be found in the "App Identity" section of the app on Windows developer dash board.

3. Create (or add to) your `build.json` in the Cordova directory like this:

```json
{
  "windows": {
    "release": {
      "packageCertificateKeyFile": "MyKey.pfx",
      "buildFlag": [
        "/p:AppxPackageIsForStore=true",
        "/p:UapAppxPackageBuildMode=StoreUpload"
      ]
    }
  }
}
```

You can now build your Windows app with the CLI using the `--release` switch. The result will be an `.appxupload` file that is accepted by the Windows Store. You need to build a separate package for each CPU architecture you want to support.

## Sideloading apps on Windows 10 (PC):

 - If not already done, put the PC in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.
 - You may have to install the certificate used to sign the app. Get the `.cer` or `.pfx` and double click it. Install it on "Local Computer" in the "Trusted Root Certification Authorities" group.
 - Now double click the `Add-AppDevPackage.ps1` file. This will start the installation.
 - After the installation is done the app will appear in the start menu.

> :point_right: The Tabris build service currently always uses the Cordova key to sign the app. In the future you will be able to use your own key to build Windows-Store-ready packages.


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
