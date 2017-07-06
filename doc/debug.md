# Debugging Tabris.js
Tabris.js supports the `console.log`, `info`, `warn`, and `error` functions that are useful for debugging.  However for more complex applications it is often perferred to use a full-fledged debugger, allowing the developer to pause script execution by setting breakpoints, allowing the inspection and redefinition of variables currently in scope.  Tabris.js supports several debuggers:

## Android
You can [Debug your app using Chrome Developer Tools](http://eclipsesource.com/blogs/2016/06/06/debugging-javascript-with-tabris-js/) without installing any special software.  Alternatively, you can use Eclipse to debug your app.  To do so you will need to use the Android Debug Bridge (ADB) from the [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools.html).  After installing the platform tools you will need to [set up your device for debugging](https://developer.android.com/studio/command-line/adb.html#Enabling).  Once set up you can follow the instructions to [debug your app using Eclipse](http://eclipsesource.com/blogs/2015/04/17/debugging-tabris-js/).

> :point_right: The console log output is also printed to the `logcat` console on when your app is build in debug mode.  The output can be viewed from the host machine by typing `adb logcat`.
