import {format} from './Formatter';

export default class EventObject {

  public readonly type!: string;
  public readonly target!: object;
  public readonly timeStamp!: number;
  private $type!: string;
  private $target!: object;
  private $defaultPrevented!: boolean;

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

  public get defaultPrevented() {
    return !!this.$defaultPrevented;
  }

  public preventDefault() {
    this.$defaultPrevented = true;
  }

  public toString() {
    const header = this.constructor.name + ' { ';
    const content = Object.keys(this)
      .map(prop =>
        `${prop}: ${typeof this[prop] === 'string' ? JSON.stringify(this[prop]) : format(this[prop])}`
      )
      .join(', ');
    const footer = ' }';
    return header + content + footer;
  }

  public _initEvent(type: string, target: object) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to initEvent');
    }
    this.$type = type;
    this.$target = target;
  }

  [data: string]: unknown;

}
