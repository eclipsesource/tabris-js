/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  var noop = function() {};
  var HTMLElement = function() {};
  HTMLElement.prototype = {
    setAttribute: noop,
    appendChild: function(el) {return el;},
    cloneNode: function() {return new HTMLElement();},
    lastChild: function() {return new HTMLElement();}
  };

  tabris._addDOMDocument = function(target) {
    target.document = {
      documentElement: {},
      createDocumentFragment: function() {return new HTMLElement();},
      createElement: function() {return new HTMLElement();},
      location: {href: ""}
    };
    tabris._addDOMEventTargetMethods(target.document);
    if (typeof target.location === "undefined") {
      target.location = target.document.location;
    }
  };

  if (typeof window !== "undefined" && !window.document) {
    tabris._addDOMDocument(window);
  }

}());
