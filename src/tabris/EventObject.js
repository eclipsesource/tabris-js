export default class EventObject {

  constructor(type, target) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to Event');
    }
    Object.defineProperties(this, {
      type: {value: type},
      target: {value: target},
      timeStamp: {value: Date.now()}
    });
  }

  get defaultPrevented() {
    return !!this.$defaultPrevented;
  }

  preventDefault() {
    this.$defaultPrevented = true;
  }

}
