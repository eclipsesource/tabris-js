export default class EventObject {

  constructor() {
    this.$type = '';
    this.$target = null;
    Object.defineProperties(this, {
      type: {enumerable: true, get: () => this.$type},
      target: {enumerable: true, get: () => this.$target},
      timeStamp: {enumerable: true, value: Date.now()}
    });
  }

  get defaultPrevented() {
    return !!this.$defaultPrevented;
  }

  preventDefault() {
    this.$defaultPrevented = true;
  }

  _initEvent(type, target) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to initEvent');
    }
    this.$type = type;
    this.$target = target;
  }

}
