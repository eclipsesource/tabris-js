# Tabris.js

Tabris.js is a framework for developing mobile apps with native UIs in JavaScript.
iOS and Android apps can be built entirely from one code base, which frees you from the task of managing code for the two platforms individually.

## Getting Started

To start developing Tabris.js applications, log in to [tabrisjs.com](http://tabrisjs.com) and select "Getting Started". Be sure to also check out code snippets, as well as examples in the Tabris.js Developer App ([Play Store](https://play.google.com/store/apps/details?id=com.eclipsesource.tabris.js) / [App Store](https://itunes.apple.com/us/app/tabris.js/id939600018?ls=1&mt=8)).

## Native performance

The code of the application is loaded dynamically - nothing is precompiled. JavaScript is executed Just-in-Time and passed via a native bridge to the device. Tabris.js accesses native controls and does not depend on webviews to render the app's UI. As a result, the performance of the apps cannot be distinguished from apps developed directly in native code of the platforms.

![Native UI demo](https://tabrisjs.com/assets/public-content/img/examples/bookstore.gif)

## Online build

Tabris.js features an online build service, which means there is no need to download huge SDKs or use specific hardware for development (e.g. a Mac machine to build for iOS). A local build is also available as an option.

## Web APIs

Tabris.js provides many web APIs, including:

* Canvas 2d context
* XMLHttpRequest
* localStorage

Tabris.js also makes use of Cordova plugins, Cordova build, npm and the CommonJS module system. The programming model is inspired, among others, by Backbone and jQuery.

## Build tabris module

Follow these steps if you want to build the tabris module yourself.

Install [Grunt](http://gruntjs.com) using [npm](http://www.npmjs.com):

    npm install -g grunt-cli

Fetch dependencies and build:

    npm install
    grunt [-v]

## License

Published under the terms of the [BSD 3-Clause License](LICENSE).
