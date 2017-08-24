---
---
# Quick Start Guide

This guide will help you create the foundation of a Tabris.js app and test it on a mobile device.

> :point_right: If you want to test a code snippet on your mobile device without creating an app on your development machine, check out the [Tabris.js Playground](https://tabrisjs.com/playground) first.

## Set up a mobile device

All you need is an Android, iOS, or Windows device, connected to the same network as your development machine.
Install the [Tabris.js 2 Developer App](developer-app.md).
Start the app and (optional) log in with your GitHub account.

## Set up your development machine

On your development machine, the following software needs to be installed:

- [Node.js](https://nodejs.org/) ([installation guide](https://docs.npmjs.com/getting-started/installing-node)). You need a version >= 6.0 (type `node -v` to check your node version).
- [Tabris CLI](https://www.npmjs.com/package/tabris-cli) (type `npm install -g tabris-cli`).
- A text editor or JavaScript IDE of your choice.

## Create your first app

Create a new empty directory for your project, open a terminal in this directory and type `tabris init`.
The _Tabris CLI_ will ask you a number of questions including the project's name and version and the type of project to create: a _JavaScript App_ or a _TypeScript App_. 

> :point_right:  TypeScript projects are more complex, but also provide type safety, better tooling and out-of-the-box declarative UI using JSX. It's especially recommendable for experienced developers coming from Java or C#.

Choose _JavaScript App_ for your first project.
The CLI will then create a simple example project and install the required dependencies. Let's have a look at the most important files:

- `package.json`: This is the central manifest file of your project. It includes your app's name and version, dependencies, and a pointer to the app's main module in the `main` field. For the details, see the [npm doc on package.json](https://www.npmjs.com/doc/files/package.json.html).
- `src/app.js`: That's your app's main JS file. You are free to change its name and location, but you have to adjust the `main` field in the `package.json`.
- `cordova/config.xml`: This is the Cordova configuration file. You won't need this file until you build your app (see [build documentation](build.md)).

Of course, you can also set up your projects manually. At the very least, you need a `package.json` with a dependency to tabris and a main JavaScript file. If you setup your project manually, you'll have to run `npm install` in this directory to install the tabris module.

## Run the app

In the project directory, type `tabris serve`. This will start a server at a free port and print its URL to the console, e.g. `http://<your-ip-address>:8080/`. Keep the server running as long as you are testing your app.

In the Developer App, go to the URL tab, enter the URL printed by the CLI and tap *Connect*. The Developer App will now download the source code and execute it on your mobile device.

Swipe from the right edge of the screen to open the developer console, which lets you restart the script or go back to the Developer App.

Now you can start developing. You may want to have a look at the rest of the documentation and the Tabris.js snippets.

## Publishing your app

For submission to the App / Play Stores you will need to bundle, brand and build your app, either using the free online build service (on [tabrisjs.com](http://tabrisjs.com)) or using a local build. This process is explained in [Build your app](build.md).

## Feedback

Help us improve Tabris.js! [Feedback](mailto:care@tabrisjs.com?subject=Feedback) is always welcome. Feel free to invite your friends if you find Tabris.js interesting.

[![Tabris.js on Twitter](img/social-logo-twitter.png)](https://twitter.com/tabrisjs)
[![EclipseSource on LinkedIn](img/social-logo-linkedin.png)](https://www.linkedin.com/company/eclipsesource)
[![EclipseSource on Google+](img/social-logo-gplus.png)](https://plus.google.com/+Eclipsesource)
[![EclipseSource on Facebook](img/social-logo-facebook.png)](https://www.facebook.com/eclipsesource)
