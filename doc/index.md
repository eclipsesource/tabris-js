# tabris.js

## Documentation
- Working with [Widget objects](widgets)
- Working with [Lists](list)
- Creating [Layouts](layout)
- Working with the [Canvas](canvas) widget
- Handle messages from [Cloud Push services](cloudPush)
- [Widgets types reference](widget-types)
- [Property types reference](property-types)
- Understand [touch events](touch-events) in tabris.js

## External Documentation
- General [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) reference and tutorials (MDN) 
- The [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) is available in tabris.js (MDN)
- Also available is the [*localStorage* object](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage), but not *sessionStorage* (MDN)
- Need a timer? You can use [these](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Timers) (MDN)
- The *context* object used by the tabris.js [Canvas](canvas) implements the [HTML5 canvas API](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D) (MDN)

## Recommended Libraries
- [Underscore.js](http://underscorejs.org/): Very useful general purpose library that helps handling JavaScript objects, arrays and functions. It's templating can also help with internationalization. 100% compatible with tabris.js. 
- Too lazy to draw your own charts? [Chart.js](http://www.chartjs.org/) can help, as demonstrated in [this example](https://github.com/eclipsesource/tabris-js/blob/master/examples/chart/chartdemo.js).
- Parts of [jQuery](http://jquery.com) can be used with tabris.js, specifically the *ajax* method. More information and an example can be found [here](https://github.com/eclipsesource/tabris-js/tree/master/examples/jquery).
- Need data binding? Use [backbonejs.org](http://backbonejs.org/). It is fully compatible except for *BackBone.View*, which can optionally be replaced with an (experimantal!) [tabris-specific implementation](https://github.com/eclipsesource/tabris-js/blob/master/examples/todo/lib/backbone). If you want to use the *sync* method you will either need jQuery-ajax (see above) or the [localStorage](https://github.com/jeromegn/Backbone.localStorage) adapter.  
