---
---
# Quick Start Guide

This guide will help you create the foundation of a Tabris.js app and test it on a mobile device.

> :point_right: This guide targets Tabris.js 3 projects. Documentation for older versions can be found [here](https://docs.tabris.com/).

## Set up a mobile device

All you need is an Android or iOS device, connected to the same network as your development machine.
Install the [Tabris.js 3 Developer App](developer-app.md).
Start the app and (optionally) log in with your GitHub account.

## Set up your development machine

> :point_right: If you want to test a code snippet on your mobile device without setting up your development machine, check out the [Tabris.js Playground](https://playground.tabris.com/) first.

On your development machine, the following software needs to be installed:

- [Node.js](https://nodejs.org/) ([installation guide](https://docs.npmjs.com/getting-started/installing-node)). You need a version >= 16.0 (type `node -v` to check your node version).
- [Tabris CLI](https://www.npmjs.com/package/tabris-cli) (type `npm install -g tabris-cli`).
- A text editor or JavaScript IDE of your choice.

## Create your first app

Create a new empty directory for your project, open a terminal in this directory and type `tabris init`.
The _Tabris CLI_ will ask you a number of questions including the project's name and version and the type of project to create:

A _Compiled_ Tabris.js app is written in JavaScript or [TypeScript](./typescript.md) and offers support for the latest EcmaScript features and [JSX](./declarative-ui.md). It is recommended for more complex Tabris.js projects. The only downside of this setup is that the code needs to be transformed before execution, which is done automatically when using the Tabris CLI or build service.

A _Vanilla_ Tabris.js app is written in plain JavaScript that is executed as-is in the JavaScript engine. As a result there may be [minor differences](./runtime.md) between the platforms.

The CLI will then create a simple example project and install the required dependencies. Let's have a look at the most important files:

- `package.json`: This is the central manifest file of your project. It includes your app's name and version, dependencies, and a pointer to the app's main module in the `main` field. Unless you are working with a _vanilla_ type project this needs to be the _compiled_ version of the module, usually in the `dist` folder.
- `src/app.js`, `src/app.jsx` or `src/app.tsx`: That's your app's main JS/TypeScript file. You are free to change its name and location, but you have to adjust the `main` field in the `package.json`.
- `cordova/config.xml`: This is the Cordova configuration file. You won't need this file until you build your app (see [build documentation](./build.md)).

Of course, you can also set up your projects manually. At the very least, you need a `package.json` with a dependency to tabris and a main JavaScript file. If you setup your project manually, you'll have to run `npm install` in this directory to install the tabris module.

## Run the app

In the project directory, type `npm start`. This will start the development server at a free port and print a QR-code to the console. Keep this server running as long as you are testing your app. In the Developer App, go to the URL tab and scan the QR-Code. (Alternatively, enter the URL printed below the QR-Code and tap *Connect*.) The Developer App will now download the source code and execute it on your mobile device.

Swipe from the right edge of the screen to open the developer console, which lets you restart the script or go back to the Developer App.

Now you can start developing. You may want to have a look at the rest of the documentation and [the Tabris.js snippets](${doc:snippetsUrl}).

## Publishing your app

For submission to the App / Play Stores you will need to bundle, brand and build your app, either using the free online build service (on [tabrisjs.com](http://tabrisjs.com)) or using a local build. This process is explained in [Build your app](build.md).

## Feedback

Help us improve Tabris.js! Feedback via [mail](mailto:care@tabrisjs.com?subject=Feedback) or [chat](https://tabrisjs.herokuapp.com/) is always welcome. Feel free to invite your friends if you find Tabris.js interesting.

[![Tabris.js on Twitter](img/social-logo-twitter.png)](https://twitter.com/tabrisjs)
[![EclipseSource on Facebook](img/social-logo-facebook.png)](https://www.facebook.com/eclipsesource)
[![EclipseSource on LinkedIn](img/social-logo-linkedin.png)](https://www.linkedin.com/company/eclipsesource)
