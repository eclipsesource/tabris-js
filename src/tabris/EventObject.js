export default class EventObject {

  constructor(type, target) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to Event');
    }
    Object.defineProperties(this, {
      type: {enumerable: true, value: type},
      target: {enumerable: true, value: target},
      timeStamp: {enumerable: true, value: Date.now()}
    });
  }

  get defaultPrevented() {
    return !!this.$defaultPrevented;
  }

  preventDefault() {
    this.$defaultPrevented = true;
  }

}
