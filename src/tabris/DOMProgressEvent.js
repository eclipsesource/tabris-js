import {extendPrototype} from './util';
import Event from './DOMEvent';

export default function ProgressEvent(type) {
  this.type = type;
}

ProgressEvent.prototype = extendPrototype(Event, {
  lengthComputable: false,
  loaded: 0,
  total: 0
});
