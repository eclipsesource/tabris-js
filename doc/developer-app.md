# The Tabris.js Developer App

The Tabris.js Developer App is the easiest way to start developing mobile apps without having to perform an app build. It is available for free on the App Store and Play Store respectively. Simply follow the links below or search for "Tabris.js" in the store on your mobile device.

[![Tabris.js on Google play](https://tabrisjs.com/assets/img/playstore-badge.png)](https://play.google.com/store/apps/details?id=com.eclipsesource.tabrisjs2)
[![Tabris.js on Apple App Store](https://tabrisjs.com/assets/img/appstore-badge.png)](https://itunes.apple.com/us/app/tabris.js-2/id1166468326?mt=8)
[![Tabris.js on Windows Store](https://tabrisjs.com/assets/img/windows-badge.png)](https://www.microsoft.com/store/apps/9n8z4pp9chtx)

After launching the app you can sign in with your GitHub account (the same you use on tabrisjs.com). This will let you access your saved scripts.

![Android Developer App](img/welcome-screen.png)

## Try the Examples

The Tabris.js examples are a collection of small apps that demonstrate the power and flexibility of the framework. They are part of the Tabris.js [GitHub repository](https://github.com/eclipsesource/tabris-js/tree/master/examples) and are developed entirely in JavaScript.

![Android Examples Tab](img/examples.png)

Just tap an example and it will run within the Developer App. You can go back to the examples selection by using the back button in Android or [the Developer Console](#the-developer-console) on either platform.

![Android Back](img/back-android.png)         ![iOS Back](img/back-ios.png)

## The Developer Console

While running Tabris.js scripts in the Developer App, you can open a developer console by sliding from the right edge of the screen to the left. On iOS you may have to start sliding from the edge itself to open the drawer.

Here you will see messages and errors logged while running a script. You can filter the log or even share it (e.g. by email). The console also lets you go back to the Developer App, or reload the script instantly.

![Developer Console](img/console-android.png)

## Play with the Playground

To make it really easy to write your first own code and to try it directly on your mobile device go to the (Playground)[https://tabrisjs.com/playground] tab. Here you can just test a code snippet without creating an app.

In the playground you find a simple, editable Tabris.js script. It is the ”Hello, World!” example.

You can run this script immediately in the Tabris.js Developer App on your mobile device: Just scan the code from the playground.

Now the example runs on your mobile device.

You can edit the code in the playground and reload to see the changes in action. Use the reload button in the developer console or reload by scanning the barcode again.

## The Tabris.js Snippets

In our [collection of snippets](https://github.com/eclipsesource/tabris-js/tree/master/snippets) you can find a code snippet for nearly every feature in Tabris.js. You can run a snippet immediately on your device by clicking the **link** button next to it...

![Android Developer App](img/button-unlinked.png)

... and then select it from the **My Scripts** list of the developer app. You may have to refresh the list by swiping down on Android or by switching tabs on iOS.

If you like to play with the snippet, simply copy and paste it to the scratchpad and run it from there.

That's it. Now you may want to have a look at the rest of the documentation and the Tabris.js snippets. When you are ready to build, read [Build your app](build.md).

### Run your App

You can test your app on an Android or iOS device if the following preconditions are met:

* you have the Developer App installed on the mobile device
* your mobile device is connected to the same network as your development machine

After [setting up your Tabris.js project](getting-started.md), navigate to its directory and type `hs` to start the HTTP-server. Keep it running as long as you are testing the application.

In the URL tab of the Developer App, enter:

    http://<development-machine-ip-address>:8080/

![App URL](img/app-url.png)

Now tap *Connect* to run the app:

![Android Developer App](img/hello.png)

Each time the your app is started, the sources are downloaded to the mobile device. While this happens you will see a blank screen. Once you've [built](#publishing-your-app) the app, this delay will be gone, because the sources are then bundled with the app.

If the URL of your development machine is stable, you can also use the *My Scripts* page on [tabrisjs.com](http://tabrisjs.com) to add it permanently to the **My Scripts** tab.

![Link A Script](img/link-app.png)
