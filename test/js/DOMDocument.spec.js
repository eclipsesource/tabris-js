describe("DOMDocument", function() {

  var target;

  beforeEach(function() {
    delete tabris._nativeBridge;
    tabris._ready = false;
    target = {};
    tabris._addDOMDocument(target);
  });

  it("creates objects document, documentElement and location", function() {
    expect(target.document).toEqual(jasmine.any(Object));
    expect(target.document.documentElement).toEqual(jasmine.any(Object));
    expect(target.document.location).toEqual(jasmine.any(Object));
    expect(target.document.location.href).toBe("");
    expect(target.location).toBe(target.document.location);
  });

  it("can create mocked HTML elements", function() {
    ["createElement", "createDocumentFragment"].forEach(function(method) {
      var element = target.document[method]();

      expect(element.setAttribute()).toBeUndefined();
      expect(element.appendChild(23)).toBe(23);
      expect(element.cloneNode().constructor).toBe(element.constructor);
      expect(element.lastChild().constructor).toBe(element.constructor);
    });
  });

  it("has event handling", function() {
    expect(function() {
      target.document.addEventListener("foo", function() {});
      target.document.removeEventListener("bar", function() {});
    }).not.toThrow();
  });

  it("fires DOMContentLoaded on tabris.load", function() {
    expect(target.document.readyState).toBe("loading");
    var listener = jasmine.createSpy();
    target.document.addEventListener("DOMContentLoaded", listener);

    tabris._init(new NativeBridgeSpy());

    expect(listener).toHaveBeenCalled();
    expect(target.document.readyState).toBe("complete"); // we skip "interactive"
  });

  it("can create HTML Element events", function() {
    var event = target.document.createEvent();
    expect(event).toEqual(jasmine.any(tabris.DOMEvent));
  });

  describe("navigator", function() {

    it("has userAgent", function() {
      expect(target.navigator.userAgent).toBe("tabris-js");
    });

  });

  describe("script element", function() {

    var script1, script2, nonScript, nativeBridge;
    var source = "bar = 1;";

    beforeEach(function() {
      script1 = target.document.createElement("script");
      script2 = target.document.createElement("script");
      nonScript = target.document.createElement("div");
      nativeBridge = new NativeBridgeSpy();
      tabris._init(nativeBridge);
      nativeBridge.load = jasmine.createSpy().and.returnValue(source);
      /*jshint evil: true */
      nativeBridge.runInThisContext = jasmine.createSpy().and.callFake(function(script) {
        window.eval(script);
      });
    });

    afterEach(function() {
      delete window.bar;
    });

    it("getElementsByTagName returns scripts added to head", function() {
      target.document.head.appendChild(script1);
      target.document.head.appendChild(script2);
      target.document.head.appendChild(nonScript);

      var result = target.document.getElementsByTagName("script");
      expect(result).toContain(script1);
      expect(result).toContain(script2);
      expect(result).not.toContain(nonScript);
    });

    it("loads and parses script", function() {
      script1.src = "foo.js";

      // Note: Unlike the browser we do this synchronously. This suffices for compatibility.
      target.document.head.appendChild(script1);

      expect(window.bar).toBe(1);
      expect(nativeBridge.runInThisContext).toHaveBeenCalledWith(source, "foo.js");
    });

    it("does not load non-script element", function() {
      nonScript.src = "foo.js";

      target.document.head.appendChild(nonScript);

      expect(window.bar).toBeUndefined();
      expect(nativeBridge.runInThisContext).not.toHaveBeenCalled();
    });

    it("calls onload after successful load", function() {
      script1.src = "foo.js";
      script1.onload = jasmine.createSpy();
      script1.onerror = jasmine.createSpy();

      target.document.head.appendChild(script1);

      expect(window.bar).toBe(1);
      expect(script1.onload).toHaveBeenCalled();
      expect(script1.onerror).not.toHaveBeenCalled();
    });

    it("calls onerror when no script is returned", function() {
      nativeBridge.load = jasmine.createSpy().and.returnValue(undefined);
      script1.src = "foo.js";
      script1.onload = jasmine.createSpy();
      script1.onerror = jasmine.createSpy();

      target.document.head.appendChild(script1);

      expect(script1.onload).not.toHaveBeenCalled();
      expect(script1.onerror).toHaveBeenCalled();
    });

  });

});
