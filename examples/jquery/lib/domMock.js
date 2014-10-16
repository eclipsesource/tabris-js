/*global location:true */
// done to prevent jQuery crash for missing DOM functionality
var noop = function(){};
var elementMock = function() {
  return {
    setAttribute: noop,
    appendChild: function() {
      return this;
    },
    cloneNode: function() {
      return this;
    },
    lastChild: function() {
      return this;
    }
  };
};
window.document = {};
window.document.documentElement = {};
window.addEventListener = noop;
document.addEventListener = noop;
document.createDocumentFragment = elementMock;
document.createElement = elementMock;
location = {};
location.href = "";