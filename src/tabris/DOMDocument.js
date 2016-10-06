import DOMEvent, {addDOMEventTargetMethods} from './DOMEvent';

var noop = function() {};

export function addDOMDocument(target) {

  var HTMLElement = function(tagName) {
    this.tagName = (tagName || '').toUpperCase();
    this.children = [];
  };
  HTMLElement.prototype = {
    setAttribute: noop,
    appendChild: function(el) {
      this.children.push(el);
      handleElementInserted(this, el, target);
      return el;
    },
    cloneNode: function() {return new HTMLElement();},
    lastChild: function() {return new HTMLElement();}
  };

  target.document = {
    documentElement: {},
    createDocumentFragment: function() {return new HTMLElement();},
    createElement: function(tagName) {return new HTMLElement(tagName);},
    location: {href: ''},
    readyState: 'loading',
    head: new HTMLElement('head'),
    getElementsByTagName: function(tagName) {
      return this.head.children.filter(function(node) {
        return node.tagName === tagName.toUpperCase();
      });
    },
    createEvent: function() {
      return new DOMEvent();
    }
  };
  addDOMEventTargetMethods(target.document);
  if (typeof target.location === 'undefined') {
    target.location = target.document.location;
  }
  tabris.load(function() {
    target.document.readyState = 'complete';
    var event = target.document.createEvent('Events');
    event.initEvent('DOMContentLoaded', false, false);
    target.document.dispatchEvent(event);
  });
}

function handleElementInserted(parent, child, target) {
  if (parent.tagName === 'HEAD' && child.tagName === 'SCRIPT' && child.src) {
    var result;
    try {
      result = tabris._client.loadAndExecute(child.src, '', '');
    } catch (ex) {
      console.error('Error loading ' + child.src + ':', ex);
      console.log(ex.stack);
      if (typeof child.onerror === 'function') {
        child.onerror.call(target, ex);
      }
      return;
    }
    if (result.loadError) {
      if (typeof child.onerror === 'function') {
        child.onerror.call(target, new Error('Could not load ' + child.src));
      }
    } else if (typeof child.onload === 'function') {
      child.onload.call(target);
    }
  }
}
