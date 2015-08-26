# Tabris.js Quickstart

This a guide for the impatient who want to start developing right away and are fine with figuring out the details later. If you run into trouble, try the [getting started guide](getting-started.md) instead.

## What you need:

- An Android and/or iOS device, connected to the same network as your development machine
- A [GitHub](https://github.com/) account, registered with http://tabrisjs.com

## Setting up the development machine

The following Software needs to be installed:

- [node.js](https://nodejs.org/), [npm](https://docs.npmjs.com/getting-started/installing-node)
- [http-server](https://www.npmjs.com/package/http-server) (type `npm install -g http-server`)
- A text editor or JavaScript IDE of your choice

## Setting up the test device:

- Download the Tabris.js developer app from [Google Play](https://play.google.com/store/apps/details?id=com.eclipsesource.tabris.js) / [Apple Appstore](https://itunes.apple.com/us/app/tabris.js/id939600018?mt=8).
- Start the app and log in with your GitHub account. This enables the "URL" tab.

## Setting up your project

Create a directory with two files:

### package.json
```js
{
  "main": "myapp.js",
  "dependencies": {
    "tabris": "^1.2.0"
  }
}
```

### myapp.js

```js
var page = tabris.create("Page", {
  topLevel: true,
  title: "myapp"
});
tabris.create("TextView", {
  layoutData: {centerX: 0, centerY: 0},
  text: "My First App"
}).appendTo(page);
```

Run `npm install` in this directory to install the tabris module.

## Run the app

- In the project directory, type `http-server`. Let the server run as long as you are testing your app.
- In the developer app, go to the URL tab and enter `http://<development-machine-ip-address>:8080/`
- Tap *Connect*.

The developer app will now download the script and execute it on your device. Swipe from the right edge of the screen to open the developer console, which lets you restart the script or go back to the developer app.

That's it. Now you may want to have a look at the rest of the documentation and the Tabris.js snippets. When you are ready to build, read [Build your app](build.md).

