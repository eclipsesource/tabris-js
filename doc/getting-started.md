# Getting Started

Welcome to Tabris.js, the framework for developing native cross-platform apps in JavaScript. This guide will help you create the foundation of a Tabris.js app and test it on a mobile device connected to your development machine.

> <img align="left" src="img/note.png"> <i> If you want to test a code snippet on your mobile device without creating an app, check out the [Playground](https://tabrisjs.com/playground) instead.</i>

## What you need:

- An Android and/or iOS device, connected to the same network as your development machine
- A [GitHub](https://github.com/) account to log in on [tabrisjs.com](http://tabrisjs.com)

## Setting up the development machine

The following software needs to be installed:

- [node.js](https://nodejs.org/), [npm](https://docs.npmjs.com/getting-started/installing-node)
- [http-server](https://www.npmjs.com/package/http-server) (type `npm install -g http-server`)
- A text editor or JavaScript IDE of your choice

## Setting up the mobile device:

- Download the Tabris.js Developer App from the [Play Store](https://play.google.com/store/apps/details?id=com.eclipsesource.tabris.js) / [App Store](https://itunes.apple.com/us/app/tabris.js/id939600018?mt=8).
- Start the app and (optional) log in with your GitHub account.
- If you need it, there is also a separate [tutorial](developer-app.md) for the Developer App.

## Create your first app

### Option 1: Setting up your project manually

Create a directory with two files:

#### package.json
```json
{
  "main": "myapp.js",
  "dependencies": {
    "tabris": "^2.0.0-beta1"
  }
}
```

#### myapp.js

```js
var page = new tabris.Page({
  topLevel: true,
  title: "myapp"
});
new tabris.TextView({
  layoutData: {centerX: 0, centerY: 0},
  text: "My First App"
}).appendTo(page);
page.open();
```

Run `npm install` in this directory to install the tabris module.

### Option 2: Setting up your project with Yeoman

You can also use the Yeoman generator to create your project. It can not only create the basic files as described above, but also prepare your project for the build process and set up ES6 or TypeScript support.

To install the Yeoman generator, use npm:

    npm install yo generator-tabris-js -g

Once installed, `cd` to an empty project directory and run `yo tabris-js`. The generator will ask you a number of questions including the project name and version. The generator will also ask you if you would like to create a _Basic JS App_, _ES6 App_ or a _TypeScript App_. This tutorial assumes you select a _Basic JS App_ to get started.


## Run the app

- In the project directory, type `hs`. Let the server run as long as you are testing your app.
- In the Developer App, go to the URL tab and enter `http://<development-machine-ip-address>:8080/`
- Tap *Connect*.

The Developer App will now download the script and execute it on your mobile device. Swipe from the right edge of the screen to open the developer console, which lets you restart the script or go back to the Developer App.

Now you can start developing. You may want to have a look at the rest of the documentation and the Tabris.js snippets.

## Publishing your app

For submission to the App / Play Stores you will need to bundle, brand and build your app, either using the free online build service or using local tools. This process is explained in [Build your app](build.md).

## Feedback
Help us improve Tabris.js! [Feedback](mailto:care@tabrisjs.com?subject=Feedback) is always welcome. Feel free to invite your friends if you find Tabris.js interesting.

[![Tabris.js on Twitter](img/social-logo-twitter.png)](https://twitter.com/tabrisjs) [![EclipseSource on LinkedIn](img/social-logo-linkedin.png)](https://www.linkedin.com/company/eclipsesource) [![EclipseSource on Google+](img/social-logo-gplus.png)](https://plus.google.com/+Eclipsesource) [![EclipseSource on Facebook](img/social-logo-facebook.png)](https://www.facebook.com/eclipsesource)
