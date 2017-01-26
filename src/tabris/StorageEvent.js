import {extendPrototype} from './util';
import DOMEvent from './DOMEvent';

export default function StorageEvent(type) {
  this.type = type;
}

StorageEvent.prototype = extendPrototype(DOMEvent, {
  bubbles: false,
  cancelable: false,
  key: '',
  oldValue: null,
  newValue: null,
  url: '',
  storageArea: null
});
