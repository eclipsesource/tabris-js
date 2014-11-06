Getting Started
===============
Welcome to Tabris Connect, the easiest way to begin with tabris.js. Once you've installed the tabris.js developer app on your device, you can run cross platform, native apps, written entirely in JavaScript.

Installing the tabris.js developer app...

Explore
=======
The tabris.js developer app comes pre-configured with several examples. These examples demonstrate the power and flexibility of tabris.js. 

![Android Developer App](img/examples.png)

The examples are freely available on GitHub and are developed entirely in JavaScript. Checkout the [GitHub repository](https://github.com/eclipsesource/tabris-js/tree/master/examples), or [download the examples as a single zip](http://tabrisjs.com/examples.zip).

See the on-line documentation for an overview of the [example apps](http://tabrisjs.com/examples).

Shared Apps
------------
In addition to the examples, other apps can be shared and executed on the device by **linking** them through the tabris connect website. Click the **link** button on the examples or snippets page to automatically add the app to your device.

![Android Developer App](img/button-unlinked.png)

From the **Apps** tab, click on the app you wish to run. If an app does not appear, you can swipe down to refresh.


Create Your First App
=====================
[Download and extend the examples](http://tabrisjs.com/examples.zip) to begin developing your first tabris.js app.

    http://tabrisjs.com/examples.zip

Hello, World!
-------------
The first example you should look at is *Hello, World!*. You can run this directly from the Examples tab in the tabris.js developer app, or extend it and host it locally. This example demonstrates how to create a minimal tabris.js app.

    [$] cd examples/hello

### index.json
The index.json file is used to describe the app, including the name, description and a list of source files. All tabris.js apps must include an index.json.

    {
     "title": "Hello, World!",
     "description": "Tabris.js - Hello, World!",
     "resources": [
      {
        "src": "http://download.eclipsesource.com/technology/tabris/js/current/tabris.min.js"
      },
      {
        "src": "hello.js"
      }
     ]
    }


### hello.js
The tabris.js Hello, World! app is contained in `examples/hello/hello.js`. Tabris.js apps can be developed using any text editor or IDE. 

	tabris.load(function() {
	
  	 var page = tabris.create("Page", {
   	   title: "Hello, World!",
   	   topLevel: true
  	  });

  	  var button = tabris.create("Button", {
        text: "Native Widgets",
        layoutData: { centerX: 0, top: 100 }
  	  }).on("selection", function() {
        label.set("text", "Totally Rock!");
  	  }).appendTo(page);

  	  var label = tabris.create("Label", {
        font: "24px",
        layoutData: {centerX: 0, top: [button, 50]}
  	  }).appendTo(page);

  	  page.open();

	});
	
The Hello, World! app contains a *button* and a *label*. When the button is selected, the label is updated. Both the button and the label are placed on the *page* relative to one another.

![Android Developer App](img/hello.png)

### Running your App
Tabris.js can load an app over-the air and execute it on the device using a JavaScript runtime and native widget bindings. The easiest way to run a tabris.js app is to point the tabris.js developer app to a webserver hosting the Javascript files. 

Node.js provides an easy to install HTTP server. Download and install [node.js](http://nodejs.org/), and using the node package manager, install `http-server`. From your hello world directory, run:

    [$] npm install http-server     
    [$] http-server ./ -p 7777

*You can also place your `index.json` and `hello.js` files on any http-server, as long as it's accessible from your device.*

Once deployed, use the tabris.js developer app to access the app. This can be configured under the URL tab on the developer app. In the case of a node-js http-server running on your development device, enter:

    http://<device-ip-address>:7777/
    
Tabris Connect can also be used to configure the URLs available on your device.

![Link App](img/link-app.png)

Make sure you enter the URL of the web server that is hosting your tabris.js app.

### The Developer Console
The tabris.js developer app ship with a developer console that can be used to track errors and warnings in the running apps. The console can be slid from the right side of the screen. The console provides functionality to filter messages and restart the app.

![Developer Console](img/console-android.png)

Messages can be logged to the console using the global console object:

    console.log("A log message");
    console.error("An error Message");
    console.warn("A warning message");
    console.info("An info message");
    console.debug("A debug Message");
    


Share
=====
Tabris.js apps can be shared using Tabris Connect. GitHub repositories are automatically listed on 


Further Information
===================
[http://tabrisjs.com](http://tabrisjs.com) is your key to tabris.js. The portal is filled with documentation, examples, the tabris.js development roadmap, and tools for connecting with your device. The website also contains links to the examples and snippets. 



Feedback
========
Help us improve tabris.js! Feedback is always welcome, 

