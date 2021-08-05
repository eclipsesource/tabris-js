import {format} from './Formatter';
import {omit} from './util';

export default class EventObject {

  readonly type!: string;
  readonly target!: object;
  readonly timeStamp!: number;
  $type!: string;
  $target!: object;
  $defaultPrevented!: boolean;
  $originalEvent?: EventObject | RawEvent;

  static create(target: object, type: string, eventData: object) {
    const uninitialized = (eventData instanceof EventObject) && !eventData.type;
    const dispatchObject = uninitialized ? eventData as EventObject : new EventObject();
    const eventTarget = (target as {$eventTarget: object}).$eventTarget || target;
    if (eventData && (eventData !== dispatchObject)) {
      const copyData = omit(eventData, ['type', 'target', 'timeStamp']) as Record<string, unknown>;
      for (const key in copyData) {
        const isPublic = /^[a-z]/.test(key);
        Object.defineProperty(dispatchObject, key, {
          value: copyData[key],
          writable: !isPublic,
          enumerable: isPublic
        });
      }
    }
    if ((dispatchObject as EventObject)._initEvent instanceof Function) {
      (dispatchObject as EventObject)._initEvent(type, eventTarget);
    }
    return dispatchObject;
  }

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

  set originalEvent(value: EventObject | null) {
    if (this.$originalEvent) {
      throw new Error('originalEvent already set');
    }
    if (value) {
      this.$originalEvent = value;
    }
  }

  get originalEvent(): EventObject | null {
    const original = this.$originalEvent;
    if (!original) {
      return null;
    }
    if (original instanceof EventObject) {
      return original;
    }
    if (original.dispatchObject instanceof EventObject) {
      return original.dispatchObject;
    }
    return this.$originalEvent = EventObject.create(original.target, original.type, original);
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

  _initEvent(type: string, target: object) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to initEvent');
    }
    this.$type = type;
    this.$target = target;
  }

  [data: string]: unknown;

}
