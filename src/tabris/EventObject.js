import {format} from './Formatter';

export default class EventObject {

  constructor() {
    Object.defineProperties(this, {
      type: {enumerable: true, get: () => this.$type},
      target: {enumerable: true, get: () => this.$target},
      timeStamp: {enumerable: true, value: Date.now()},
      $type: {enumerable: false, writable: true, value: ''},
      $target: {enumerable: false, writable: true, value: null},
      $defaultPrevented: {enumerable: false, writable: true, value: false}
    });
  }

  get defaultPrevented() {
    return !!this.$defaultPrevented;
  }

  preventDefault() {
    this.$defaultPrevented = true;
  }

  toString() {
    const header = this.constructor.name + ' { ';
    const content = Object.keys(this)
      .map(prop =>
        `${prop}: ${typeof this[prop] === 'string' ? JSON.stringify(this[prop]) : format(this[prop])}`
      )
      .join(', ');
    const footer = ' }';
    return header + content + footer;
  }

  _initEvent(type, target) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to initEvent');
    }
    this.$type = type;
    this.$target = target;
  }

}

Object.defineProperty(EventObject.prototype, 'type', {value: ''});
Object.defineProperty(EventObject.prototype, 'target', {value: null});
Object.defineProperty(EventObject.prototype, 'timeStamp', {value: 0});
