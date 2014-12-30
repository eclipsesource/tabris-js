# tabris.js

Tabris.js is a mobile framework that lets you develop native iOS and Android apps entirely in JavaScript. You can develop your apps cross-platform, without the typical performance penalties you know from other cross-platform toolkits (no WebViews involved). You are more than welcome to use existing JavaScript libraries and native extensions to build upon the core functionality.

## Documentation
- Working with [Widget objects](widgets)
- Creating [Layouts](layout)
- Working with the [Canvas](canvas) widget
- Including [Cordova plug-ins](cordova)
- Understand [touch events](touch-events) in tabris.js

## API Reference
- [Widgets types](widget-types)
- [Property types](property-types)

## External Documentation
- General [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) reference and tutorials (MDN) 
- Tabris features a module system compatible to [Node.js Modules](http://nodejs.org/docs/latest/api/modules.html).
- The [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) is available in tabris.js (MDN)
- Also available is the [*localStorage* object](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage), but not *sessionStorage* (MDN)
- Need a timer? You can use [these](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Timers) (MDN)
- The *context* object used by the tabris.js [Canvas](canvas) implements the [HTML5 canvas API](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D) (MDN)

## Recommended Libraries
- [Underscore.js](http://underscorejs.org/): Very useful general purpose library that helps handling JavaScript objects, arrays and functions. It's templating can also help with internationalization. 100% compatible with tabris.js.
- Too lazy to draw your own charts? [Chart.js](http://www.chartjs.org/) can help, as demonstrated in [this example](https://github.com/eclipsesource/tabris-js/blob/master/examples/chart/chartdemo.js).
- Parts of [jQuery](http://jquery.com) can be used with tabris.js, specifically the `ajax` method. More information and an example can be found [here](https://github.com/eclipsesource/tabris-js/tree/master/examples/jquery).
- Need data binding? Use [backbonejs.org](http://backbonejs.org/). It is fully compatible except for *BackBone.View*. If you want to use the `sync` method you will either need jQuery-ajax (see above) or the [localStorage](https://github.com/jeromegn/Backbone.localStorage) adapter.
