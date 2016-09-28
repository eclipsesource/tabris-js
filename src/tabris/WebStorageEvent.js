import {extendPrototype} from './util';
import DOMEvent from './DOMEvent';

export default function WebStorageEvent(type) {
  this.type = type;
}

WebStorageEvent.prototype = extendPrototype(DOMEvent, {
  bubbles: false,
  cancelable: false,
  key: '',
  oldValue: null,
  newValue: null,
  url: '',
  storageArea: null
});
