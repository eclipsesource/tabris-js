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

Windows 10 (UWP/Store Apps) support was added in Tabris.js 2.0 and is still catching up to the other platforms in terms of API support. It also features a few APIs specific to Windows. These are prefixed with `win_` and documented in the API reference.

The following APIs are not yet supported on Windows:
  - `ui.statusBar`: Property `theme`. Property `displayMode` is partially supported (`float` is treated the same as `hide`).
  - `ui.navigationBar`
  - `Drawer`: Events `open` and `close`.
  - `CollectionView`: Properties `refreshEnabled`, and `columnCount`.
  - `ImageView`: Property `tintColor`.
  - `Tab`: Properties `badge`, `image` and `selectedImage`.
  - `TabFolder`: Property `paging`. (Behaves as if always `true`.)
  - `TextInput`: Properties `alignment`, `autoCapitalize`, `fillColor`, `borderColor`, `keepFocus`. `type` is partially supported. (Can not be set to `search`).
  - `WebView`: Events `download` and `message`. Method `postMessage`.

There are also some APIs only supported on Windows which are prefixed with `win_`:
 - `device`: Properties `win_keyboardPresent` and `win_primariyInput`.
 - `Widget`: Property `win_theme`.
 - `Action`: Property `win_symbol`.
 - `Drawer`: Properties `win_targetView` and `win_displayMode`.
 - `NavigationView`: Properties `win_toolbarTheme`, `win_toolbarOverflowTheme`, `win_drawerActionTheme` and `win_drawerActionBackground`.
 - `TabFolder`: Property `win_tabBarTheme`.

## Sideloading apps on Windows 10 (PC):

 - If not already done, put the PC in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.
 - If you do not already have it, [get the App Installer from the Windows Store](https://www.microsoft.com/store/apps/9nblggh4nns1).
 - You may have to install the certificate used to sign the app. Get the `.cer` or `.pfx` and double click it. Install it on "Local Computer" in the "Trusted Root Certification Authorities" group.
 - Now double click the `appxbundle`. Windows Smartscreen may warn you about installing the app, but by clicking "More Information" you can continue anyway.
 - After the installation is done the app will appear in the start menu.

> :point_right: The tabris build service uses the cordova key to sign the app in case no other key is provided. You can download it [here](https://github.com/apache/cordova-windows/raw/4.2.x/template/CordovaApp_TemporaryKey.pfx).


## Sideloading apps on Windows 10 (Mobile):

 - If not already done, put the phone in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.

Now there are two options. You may download the `appxbundle` directly from your phone (or copy to it via USB) and install it from there:
 - Move the `appxbundle` to your phone.
 - Find the file in the file explorer app.
 - Tap the app. Confirm that you want to install the app.
 - The app is installed in the background. Unfortunately you don't get any feedback when the process is done. The app should appear after a minute or so on the "all apps" screen.

 > :point_right: When you download an `appxbundle` file using the Edge browser, it may rename it to a `.zip` file. You must use the file explorer to rename it to its original.

The other option is to install the app from a Windows PC. This requires the Windows 10 SDK to be installed.
 - Attach the phone to your Windows PC using an USB cable.
 - Open a command prompt (`cmd.exe`).
 - Enter `"C:\Program Files (x86)\Windows Kits\10\bin\x86\WinAppDeployCmd.exe" devices`
 - Copy the GUID of your phone.
 - Enter `"C:\Program Files (x86)\Windows Kits\10\bin\x86\WinAppDeployCmd.exe" install -file "<path-to-your-appxbundle>" -g <GUID-of-your-phone>`

## Generating keys for the Windows Store
 - To create an `appxupload` file that is accepted by the Windows Store you will need to sign it using a `.pfx` file specific to your Windows Store account. This requires the tools `makecert.exe` and `pvk2pfx.exe`. If you have Visual Studio 2016 (or just the Windows 10 SDK) installed you can find it in `C:\Program Files (x86)\Windows Kits\10\bin\x64\`. If not you can [download a standalone SDK from Microsoft](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk).

 On the developer dash board go to the account settings (upper right) to find the "Windows publisher ID".

<img align="left" src="img/windows-publisher-id.png">

Open a Windows commandline (`cmd.exe`) and enter the following commands *exactly*, but replace

 - <publisher-id> with your publisher ID including `CN=` (!),
 - <date> with an expiration date (`mm/dd/yyyy`) of your choice,
 - <key-name> with the desired name of the `.pfx` file.

```
"C:\Program Files (x86)\Windows Kits\10\bin\x64\makecert.exe" -n "<publisher-id>" -r -h 0 -eku "1.3.6.1.5.5.7.3.3,1.3.6.1.4.1.311.10.3.13" -e "<date>" -sv <key-name>.pvk <key-name>.cer

"C:\Program Files (x86)\Windows Kits\10\bin\x64\pvk2pfx.exe" -pvk <key-name>.pvk -spc <key-name>.cer -pfx <key-name>.pfx
```

When prompted, leave the password field blank. Otherwise the `.pfx` won't be useable for signing on the build service.

You should now have a `.pfx` file in your users home directoy.
