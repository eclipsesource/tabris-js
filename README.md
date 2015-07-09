# Tabris.js

Tabris.js is a framework for developing mobile apps with native UIs in JavaScript.
iOS and Android apps can be built entirely from one code base, which frees developers from the task of managing code for the two platforms individually.

## Getting Started

To start developing Tabris.js applications, log in to [tabrisjs.com](http://tabrisjs.com) and select "Getting Started". Be sure to also check out code snippets, as well as examples in the Tabris.js Developer App ([Play Store](https://play.google.com/store/apps/details?id=com.eclipsesource.tabris.js) / [App Store](https://itunes.apple.com/us/app/tabris.js/id939600018?ls=1&mt=8)).

## Native performance

The code of the application is loaded dynamically - nothing is precompiled. JavaScript is executed Just-in-Time and passed via a native bridge to the device. Tabris.js accesses native controls and does not depend on webviews to render the app's UI. As a result, the performance of the apps cannot be distinguished from apps developed directly in native code of the platforms.

## Online build

Tabris.js features an online build service, which means there is no need to download huge SDKs or use specific hardware for development (e.g. a Mac machine to build for iOS). A local build is also available as an option.

## Leverage web APIs

Whenever needed Tabris.js makes use of web technologies to enhance functionality or make development easier. Tabris.js can integrate with existing JavaScript libraries, node modules and Cordova plugins. Using Cordova plugins is not associated with any performance penalties as only native code is used (no WebViews involved). Tabris.js fluent programming model inspired by Backbone makes the development easy even for programmers who are new to JavaScript, while Common.js and npm provide an easy to comprehend, familiar project structure. In addition, Tabris.js maintains W3C compatibility and is able to implement many APIs core to web applications, e.g. XMLHttpRequest or the 2d canvas.

## Build

Follow these steps if you want to build the tabris module yourself.

Install [Grunt](http://gruntjs.com) using [npm](http://www.npmjs.com):

    npm install -g grunt-cli

Fetch dependencies and build:

    npm install
    grunt [-v]

## License

Published under the terms of the [BSD 3-Clause License](LICENSE).
