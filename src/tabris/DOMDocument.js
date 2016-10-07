import DOMEvent, {addDOMEventTargetMethods} from './DOMEvent';

let noop = function() {};

export function addDOMDocument(target) {

  let HTMLElement = function(tagName) {
    this.tagName = (tagName || '').toUpperCase();
    this.children = [];
  };
  HTMLElement.prototype = {
    setAttribute: noop,
    appendChild(el) {
      this.children.push(el);
      handleElementInserted(this, el, target);
      return el;
    },
    cloneNode() {return new HTMLElement();},
    lastChild() {return new HTMLElement();}
  };

  target.document = {
    documentElement: {},
    createDocumentFragment() {return new HTMLElement();},
    createElement(tagName) {return new HTMLElement(tagName);},
    location: {href: ''},
    readyState: 'loading',
    head: new HTMLElement('head'),
    getElementsByTagName(tagName) {
      return this.head.children.filter(node => node.tagName === tagName.toUpperCase());
    },
    createEvent() {
      return new DOMEvent();
    }
  };
  addDOMEventTargetMethods(target.document);
  if (typeof target.location === 'undefined') {
    target.location = target.document.location;
  }
  tabris.load(() => {
    target.document.readyState = 'complete';
    let event = target.document.createEvent('Events');
    event.initEvent('DOMContentLoaded', false, false);
    target.document.dispatchEvent(event);
  });
}

function handleElementInserted(parent, child, target) {
  if (parent.tagName === 'HEAD' && child.tagName === 'SCRIPT' && child.src) {
    let result;
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
