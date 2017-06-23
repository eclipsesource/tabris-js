export default class EventObject {

  constructor(type, target, data = {}) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to Event');
    }
    Object.defineProperties(this, {
      type: {enumerable: true, value: type},
      target: {enumerable: true, value: target},
      timeStamp: {enumerable: true, value: Date.now()}
    });
    for (let key in data) {
      if (!(key in this)) {
        Object.defineProperty(this, key, {enumerable: true, value: data[key]});
      }
    }
  }

  get defaultPrevented() {
    return !!this.$defaultPrevented;
  }

  preventDefault() {
    this.$defaultPrevented = true;
  }

}
