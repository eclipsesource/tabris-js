# Getting Started

Welcome to Tabris.js, the framework for developing native cross-platform apps in JavaScript. This guide will help you start developing Tabris.js apps in minutes.

## What you need:

- An Android and/or iOS device, connected to the same network as your development machine
- A [GitHub](https://github.com/) account to login on [tabrisjs.com](http://tabrisjs.com)

## Setting up the development machine

The following software needs to be installed:

- [node.js](https://nodejs.org/), [npm](https://docs.npmjs.com/getting-started/installing-node)
- [http-server](https://www.npmjs.com/package/http-server) (type `npm install -g http-server`)
- A text editor or JavaScript IDE of your choice

## Setting up the test device:

- Download the Tabris.js developer app from the [Google Play](https://play.google.com/store/apps/details?id=com.eclipsesource.tabris.js) / [Apple Appstore](https://itunes.apple.com/us/app/tabris.js/id939600018?mt=8).
- Start the app and log in with your GitHub account. This enables the "URL" tab.
- If you need it, there is also a separate [tutorial](developer-app.md) for the app itself.

## Create your first app

### Option 1: Setting up your project manually

Create a directory with two files:

#### package.json
```js
{
  "main": "myapp.js",
  "dependencies": {
    "tabris": "^1.10.0"
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

To install Yeoman and the generator, use npm:

    npm install yo generator-tabris-js -g

Once installed, `cd` to an empty project directory and run `yo tabris-js`. The generator will ask you a number of questions including the project name and version. The generator will also ask you if you would like to create a _Basic JS App_, _ES6 App_ or a _TypeScript App_. This tutorial assumes you select a _Basic JS App_ to get started.


## Run the app

- In the project directory, type `hs`. Let the server run as long as you are testing your app.
- In the developer app, go to the URL tab and enter `http://<development-machine-ip-address>:8080/`
- Tap *Connect*.

The developer app will now download the script and execute it on your device. Swipe from the right edge of the screen to open the developer console, which lets you restart the script or go back to the developer app.

Now you can start developing. You may want to have a look at the rest of the documentation and the Tabris.js snippets.

## Publishing your app

For submission to the App / Play Stores you will need to bundle, brand and build your app, either using the free online build service or using local tools. This process is explained in [Build your app](build.md).

## Feedback
Help us improve Tabris.js! [Feedback](mailto:care@eclipsesource.com?subject=Tabris.js%20feedback) is always welcome. Feel free to invite your friends if you find Tabris.js interesting.

