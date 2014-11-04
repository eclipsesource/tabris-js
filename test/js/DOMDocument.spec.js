/**
* Copyright (c) 2014 EclipseSource.
* All rights reserved.
*/

describe("DOMDocument", function() {

  var target;

  beforeEach(function() {
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

});
