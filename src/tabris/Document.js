import Event, {addDOMEventTargetMethods} from './Event';
import {log, error} from './Console';

export function addDOMDocument(target) {

  class HTMLElement {

    constructor(tagName) {
      this.tagName = (tagName || '').toUpperCase();
      this.children = [];
    }

    setAttribute() {
    }

    appendChild(el) {
      this.children.push(el);
      handleElementInserted(this, el, target);
      return el;
    }

    cloneNode() {
      return new HTMLElement();
    }

    lastChild() {
      return new HTMLElement();
    }

  }

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
    createEvent(type) {
      return new Event(type);
    }
  };

  addDOMEventTargetMethods(target.document);
  if (typeof target.location === 'undefined') {
    target.location = target.document.location;
  }

  tabris.once('start', () => {
    target.document.readyState = 'complete';
    const event = new Event('DOMContentLoaded', false, false);
    target.document.dispatchEvent(event);
  });

}

function handleElementInserted(parent, child, target) {
  if (parent.tagName === 'HEAD' && child.tagName === 'SCRIPT' && child.src) {
    let result;
    try {
      result = tabris._client.loadAndExecute(child.src, '', '');
    } catch (ex) {
      error('Error loading ' + child.src + ':', ex);
      log(ex.stack);
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
