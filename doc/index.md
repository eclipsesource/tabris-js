# Tabris.js - 0.9.3

Tabris.js is a mobile framework that lets you develop native iOS and Android apps entirely in JavaScript. You can develop your apps cross-platform, without the typical performance penalties you know from other cross-platform toolkits (no WebViews involved). You are more than welcome to use existing JavaScript libraries and native extensions to build upon the core functionality.

## Documentation
- [Modules](modules) - How to organize and load scripts.
- [Widgets](widgets) - Widgets basics.
- [Selector API](selector) - Working more efficiently with widgets. 
- [Layouts](layout) - Layouting widgets.
- [Animations](animations) - Animating widgets.
- [Touch API](touch-events) - Processing widget gesture/touch events.
- [Canvas](canvas) - Drawing with HTML Canvas API.
- [Cordova Support](cordova) - Using cordova plug-ins in Tabris.js.
- [Device](device) - Access information about the current device.
- [App](device) - Access information about the application instance.
- [W3C APIs](w3c-api) - XMLHttpRequest, LocalStorage and timer.

## API Reference
- [Widgets types](widget-types)
- [Property types](property-types)

## Recommended Libraries
- [Underscore.js](http://underscorejs.org/): Very useful general purpose library that helps handling JavaScript objects, arrays and functions. It's templating can also help with internationalization. 100% compatible with Tabris.js.
- Too lazy to draw your own charts? [Chart.js](http://www.chartjs.org/) can help, as demonstrated in [this example](https://github.com/eclipsesource/tabris-js/blob/master/examples/chart/chartdemo.js).
- Parts of [jQuery](http://jquery.com) can be used with Tabris.js, specifically the `ajax` method. More information and an example can be found [here](https://github.com/eclipsesource/tabris-js/tree/master/examples/jquery).
- Need data binding? Use [backbonejs.org](http://backbonejs.org/). It is fully compatible except for *BackBone.View*. If you want to use the `sync` method you will either need jQuery-ajax (see above) or the [localStorage](https://github.com/jeromegn/Backbone.localStorage) adapter.
