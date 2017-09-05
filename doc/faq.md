---
---
# FAQ

## General Questions

### Where can I see examples of what Tabris.js can do?

To see examples of widgets and layouts, download the [Developer App](developer-app.md) and have a look at the Examples section.
In addition, we have many code [snippets](https://github.com/eclipsesource/tabris-js/tree/master/snippets) demonstrating how to use specific API.

### Is the framework open source?

The JavaScript part of the framework is fully [open sourced](https://github.com/eclipsesource/tabris-js).
The native client implementations are closed-source, but free.
The source code of the native clients is available for [organization customers](https://tabrisjs.com/pricing).

### Does Tabris.js use HTML?

No, unlike a regular Cordova app, the UI created by Tabris.js apps consists of truly native components.

### What's the relationship between Cordova/PhoneGap and Tabris.js

Tabris.js uses Cordova in two ways:

  1. To access native APIs via Cordova plugins and
  2. To build apps via the Cordova build system

The Tabris.js developers have no affiliation with the [Apache Software Foundation](http://apache.org/).

### Can I really build one iOS/Android/Windows app from a single JavaScript codebase?

Yes. Tabris.js maps JavaScript widgets to native widgets which lets you create a distinctive UI and user experience on all three platforms. Unlike HTML based apps, it does *not* look the same on each platform. Instead it matches the native styles of each platform.

### What kind of apps can be developed with Tabris.js?

Tabris.js is suitable for all kind of apps that rely on native UI components. It's not suitable for apps that rely heavily on sophisticated 2D/3D graphics or CPU intensive tasks, such as games.

### Does Tabris.js compile JavaScript to native code?

No, the JavaScript code is executed directly on the mobile device inside a JavaScript engine. However, if you use TypeScript and/or JSX, your code is first "transpiled" to pure JavaScript in an extra build step.

### Is Tabris.js based on Eclipse technology? Can I develop in Java?

No, that would be ["Tabris for RAP"](https://eclipsesource.com/products/tabris), the predecessor of Tabris.js.

### What platform versions does Tabris.js support?

|         | Tabris.js 1.x | Tabris.js 2.x |
|---------|---------------|---------------|
| Android | 4.1 and up    | 4.2 and up    |
| iOS     | iOS 8 and up  | iOS 9 and up  |
| Windows | N/A           | 10            |

## Development

### Do I need to have prior mobile development or JavaScript experience?

Some entry-level JavaScript (or TypeScript) knowledge is recommended. Everything else is described in our documentation.

### Do I need to download any SDKs?

No. As a matter of fact, using the [Developer App](developer-app.md) you can experience Tabris.js coding via the [Tabris.js Playground](https://tabrisjs.com/playground) without any further setup what so ever. If you want to get serious, [your development machine can be set up in minutes](../latest/getting-started.md).

### What APIs does Tabris.js support?

Tabris.js provides a JavaScript/TypeScript API to indirectly create and control native UIs. It also offers [EcmaScript 6 features](../latest/lang.md) and some [well known browser APIs](../latest/w3c-api.md), such as `fetch`, `WebSocket` or `localStorage`. In addition, native functionality like device sensors, camera or notifications are available as Cordova plugins. You can also [write your own](custom-widgets.md) Cordova plug-ins and native custom widgets.

### Does Tabris.js support declarative UI?

Yes, [via JSX](../latest/lang.md#JSX).

### Does Tabris.js have a WYSIWYG editor?

Currently no. However, thanks to [remote script loading](../latest/developer-app.md#the-developer-console), you can see the effects of changes to your UI code almost instantly. You can do this with the [Developer App](developer-app.md) or any Tabris.js app that was [built with the debug option](../latest/build.md#settings).

### How to use the "nightly" Tabris.js build?

If you want to keep up with the latest developments in Tabris.js, you can consume Tabris.js from the dist tag `"nightly"`. In your `package.json`, set the dependency for the `tabris` module to `"nightly"` or run `npm install tabris@nightly`. You then have to build the app using the [build service or Tabris CLI](../latest/build.md). The [Developer Apps](developer-app.md) from the stores may not work with nightly builds of the `tabris` module.

### How can I build my apps locally?

You can use the [Tabris CLI](https://www.npmjs.com/package/tabris-cli) to build Tabris.js apps on your machine.
This also requires the SDKs for the respective platform (e.g. the Android SDK for Android).
See [Local Build](../latest/build.md#local-build) for a detailed guide.

### Is Tabris.js 100% compatible with Cordova plug-ins?

No, plug-ins that access the DOM of an HTML page won't work because Tabris.js uses a native UI. This is especially true on Windows, where most Cordova plug-ins use HTML in some way. However, many Cordova plug-ins that provide access to device functions such as sensors will work out of the box.

### How can I test Cordova plug-ins?

You can test several prepackaged plug-ins directly from the [Tabris.js developer app](developer-app.md).
These include camera, device motion, dialogs and more (see [Default Plug-ins](cordova.md#cordova-plugins-support)).

In order to test additional plug-ins you will need to [add them to your `config.xml`](../latest/build.md#integrating-cordova-plugins) and [build the app](build.md). If [you enable the debug option](../latest/build.md#settings), the developer console will still be available and allow you to load newer app code via [developer console](../latest/developer-app.md#the-developer-console) without re-building the entire app.

### Can I create my own native plugins?

Yes. The [downloadable](https://tabrisjs.com/download) Tabris.js platforms (sign-in required) for Android and iOS allow you to create native plugins. See the respective docs for [Android](custom-widgets-android.md) and [iOS](custom-widgets-ios.md) for technical details.

## Payment

### Is Tabris.js free?

Yes, you can get the Cordova platforms that you need to build a fully-fledged Tabris.js app for free. However, [the build service is limited for free users](https://tabrisjs.com/pricing/).

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

## Windows-specific Questions

### How do I connect to a localhost/127.0.0.1 URL?

Windows apps need a special permission to enable loopback addresses. It's explained [in the Windows article](../latest/windows-support.md) how to do this.

### How can I submit my app to the Windows Store?

See "Building an App" in the [in the Windows article](../latest/windows-support.md).
