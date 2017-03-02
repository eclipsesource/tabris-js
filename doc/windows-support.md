# Notes on Windows 10 Support

## API

Windows 10 (UWP/Store Apps) support was added in Tabris.js 2.0 and is still catching up to the other platforms in terms of API support. It also features a few APIs specific to Windows. These are prefixed with `win_` and documented in the API reference.

The following classes and objects are not yet supported on Windows:
 - `crypto`
 - `app`
 - `WebSocket`
 - `SearchAction`
 - `ui.statusBar`
 - `ui.navigationBar`

 The following Classes and objects are currently only partially supported:
  - `Drawer`: No `open` and `close` events fired.
  - `Button`: Property `alignment` is ignored. Button content is always centered.
  - `CollectionView`: Methods `insert`, `refresh`, `remove` and `reveal`, as well as the properties `refreshEnabled` and `columnCount` are ignored.
  - `ImageView`: Property `tintColor` is ignored.
  - `NavigationView`: Properties `toolbarVisible` and `animated` are ignored. Both behave as if `true`.
  - `ScrollView`: Methods `scrollToX` and `scrollToY` have no effect.
  - `Tab`: Properties `badge`, `image` and `selectedImage` are ignored. Only the title is displayed.
  - `TabFolder`: Property `paging` is ignored, behaves as if always `true`.
  - `TextInput`: Properties `alignment`, `autoCapitalize`, `editable`, `fillColor`, `borderColor`, `keepFocus` are ignored. Setting `type` to `search` has no effect, but `password` and `multiline` work. `focused` is unsupported and will not reflect whether or not the field is actually focused. However, **all events are supported**, including `focus` and `blur`.
  - `TextView`: Properties `maxLines`, `selectable` and `lineSpacing` are ignored.
  - `ToggleButton`: Properties `image` and `alignment` are ignored. The content is always centered.
  - `WebView`: No `download` or `message` events are fired. The `postMessage` method has no effect.

## Sideloading apps on Windows 10 (PC):

 - If not already done, put the PC in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.
 - If you do not already have it, [get the App Installer from the Windows Store](https://www.microsoft.com/store/apps/9nblggh4nns1).
 - You may have to install the certificate used to sign the app. Get the `.cer` or `.pfx` and double click it. Install it on "Local Computer" in the "Trusted Root Certification Authorities" group.
 - Now double click the `appxbundle`. Windows Smartscreen may warn you about installing the app, but by clicking "More Information" you can continue anyway.
 - After the installation is done the app will appear in the start menu.

> <img align="left" src="img/note.png"> <i>The tabris build service uses the cordova key to sign the app in case no other key is provided.</i> You can download it [here](https://github.com/apache/cordova-windows/raw/4.2.x/template/CordovaApp_TemporaryKey.pfx).


## Sideloading apps on Windows 10 (Mobile):

 - If not already done, put the phone in to developer mode: `Settings -> Update & security -> For developers -> Developer mode`.
 - If a previous version of this app exists, uninstall it.

Now there are two options. You may download the `appxbundle` directly from your phone (or copy to it via USB) and install it from there:
 - Move the `appxbundle` to your phone.
 - Find the file in the file explorer app.
 - Tap the app. Confirm that you want to install the app.
 - The app is installed in the background. Unfortunately you don't get any feedback when the process is done. The app should appear after a minute or so on the "all apps" screen.

 > <img align="left" src="img/note.png"> <i>When you download an `appxbundle` file using the Edge browser, it may rename it to a `.zip` file.</i> You must use the file explorer to rename it to its original.

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
