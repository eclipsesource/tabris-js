(function() {

  var noop = function() {};
  var HTMLElement = function(tagName) {
    this.tagName = (tagName || "").toUpperCase();
    this.children = [];
  };
  HTMLElement.prototype = {
    setAttribute: noop,
    appendChild: function(el) {
      this.children.push(el);
      handleElementInserted(this, el);
      return el;
    },
    cloneNode: function() {return new HTMLElement();},
    lastChild: function() {return new HTMLElement();}
  };

  tabris._addDOMDocument = function(target) {
    target.document = {
      documentElement: {},
      createDocumentFragment: function() {return new HTMLElement();},
      createElement: function(tagName) {return new HTMLElement(tagName);},
      location: {href: ""},
      readyState: "loading",
      head: new HTMLElement("head"),
      getElementsByTagName: function(tagName) {
        return this.head.children.filter(function(node) {
          return node.tagName === tagName.toUpperCase();
        });
      },
      createEvent: function() {
        return new tabris.DOMEvent();
      }
    };
    tabris._addDOMEventTargetMethods(target.document);
    if (typeof target.location === "undefined") {
      target.location = target.document.location;
    }
    tabris.load(function() {
      target.document.readyState = "complete";
      var event = document.createEvent("Events");
      event.initEvent("DOMContentLoaded", false, false);
      target.document.dispatchEvent(event);
    });
    target.navigator = {
      userAgent: "tabris-js" // TODO: identify OS/device?
    };
  };

  if (typeof window !== "undefined" && !window.document) {
    tabris._addDOMDocument(window);
  }

  function handleElementInserted(parent, child) {
    if (parent.tagName === "HEAD" && child.tagName === "SCRIPT" && child.src) {
      var result;
      try {
        result = tabris._client.loadAndExecute(child.src, "", "");
      } catch (ex) {
        console.error("Error in " + child.src + ": " + ex);
        console.log(ex.stack);
        if (typeof child.onerror === "function") {
          child.onerror.call(window, ex);
        }
        return;
      }
      if (result.loadError) {
        if (typeof child.onerror === "function") {
          child.onerror.call(window, new Error("Could not load " + child.src));
        }
      } else if (typeof child.onload === "function") {
        child.onload.call(window);
      }
    }
  }

}());
