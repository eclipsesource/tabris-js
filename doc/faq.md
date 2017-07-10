---
---
# FAQ

## General Questions

### What types of native APIs does Tabris.js support?

Tabris.js provides API to create and control native UIs. In addition, some native functionality like device sensors, camera or specific native APIs like push notifications are available as Cordova plugins.

### Can I really single source an iOS and Android app?

Yes, you can. Tabris.js maps JavaScript widgets to native widgets which lets you create a distinctive UI and user experience on both platforms.

### Where can I see examples of what Tabris.js can do?

To see examples of widgets and layouts, download the [Developer App](developer-app.md) and have a look at the Examples section.
For an explanation of the underlying concepts, check out the [“Tabris.js Examples” blog series](http://eclipsesource.com/blogs/tag/tabris-js-examples/). In addition, we have many code [snippets](https://github.com/eclipsesource/tabris-js/tree/master/snippets) demonstrating how to use specific API.

### How can a framework that uses Cordova produce native apps?

Unlike a regular Cordova app, a Tabris.js app is built without HTML and its UI is truly native.
Tabris.js uses Cordova in two ways:

  1. To access native APIs via Cordova plugins and
  2. To build apps via the Cordova build system

Find out more about how Tabris.js and Cordova fill each other’s gap: [Apache Cordova vs Tabris.js] (http://eclipsesource.com/blogs/2015/03/02/apache-cordova-vs-tabris-js/).

## Development

### How to use the "nightly" Tabris.js build?

If you want to keep up with the latest developments in Tabris.js, you can consume tabris.js from the dist tag `"nightly"`.
In your `package.json`, set the dependency for tabris to `"nightly"` or run `npm install tabris@nightly`.
In the build service, select *nightly* for Tabris.js version in [build settings](build.md#settings).

## Building an app

### How can I build my apps locally?

You can use the [Tabris CLI](https://www.npmjs.com/package/tabris-cli) to build Tabris.js apps on your machine.
This also requires the SDKs for the respective platform (e.g. the Android SDK for Android).
See [Local Build](local-build.md) for a detailed guide.

## Licensing

### Is all of the framework Open Source?

The JavaScript part of the framework is fully [open sourced](https://github.com/eclipsesource/tabris-js).
However, the native client implementations are closed-source.
The source code of the native clients is available for organization customers.

## Extending the framework

### Is Tabris.js 100% compatible with Cordova plug-ins?

Many Cordova plug-ins that provide access to device functions will work out of the box.
However, plug-ins that access the DOM of an HTML page won't work because Tabris.js uses a native UI.

### How can I test Cordova plug-ins?

You can test several prepackaged plug-ins directly from the [Tabris.js developer app](developer-app.md).
These include camera, device motion, dialogs and more (see [Default Plug-ins](cordova.md#cordova-plugins-support)).

In order to test additional plug-ins you will need to [create a custom build app](build.md).
You can either create a release-ready version of your own app, or an enhanced version of the developer app which contains the additional plug-Ins.
For the latter, set debug mode to <code>ON</code>.

### Is it possible to create native plugins written in Java or Objective-C?

Yes, it is possible. The [downloadable](https://tabrisjs.com/download) Tabris.js platforms (sign-in required) for Android and iOS allow you to create native plugins. See the respective docs for [Android](custom-widgets-android.md) and [iOS](custom-widgets-ios.md) for technical details.

## Payment

### Is my credit card data safe with you?

We don't store your credit card data. We use [Braintree](https://www.braintreepayments.com/) to process all payments, and it never passes your credit card information to us. Braintree is a certified Level 1 PCI DSS provider.

## Android-specific Questions

### How can I add additional Android manifest permissions?

If you are using Cordova plug-ins, the plug-ins themselves are responsible for adding all necessary permissions, in which case you don't need to handle them at all.

If you are targeting pre Android 6 devices and you need to modify permissions yourself at build time, you can create a build hook ([official Cordova hooks guide](http://cordova.apache.org/docs/en/edge/guide_appdev_hooks_index.md.html#Hooks%20Guide)).

## iOS-specific Questions

### My app gets stuck on "Installing" stage when I submit it to the App Store?

You have to use an app store provisioning profile if you want to submit the app to iTunes connect for verification. Otherwise use an ad hoc profile to run the app on your devices.

### My app builds correctly when using "debug", but fails in release mode. What can I do?

Make sure that you have downloaded the right certificate and provisioning profile from [developer.apple.com](https://developer.apple.com). The certificate should be for "Production" use and the provisioning profile for "Distribution". Then upload the provisioning profile with the corresponding p12 file at [tabrisjs.com](https://tabrisjs.com).
