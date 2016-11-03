export default class EventSubscription {

  constructor(target, type, listener, context) {
    defineReadOnlyProperties(this, {_target: target, _type: type, _listener: listener, _context: context});
    target.on(type, listener, context);
  }

  cancel() {
    this._target.off(this._type, this._listener, this._context);
  }

}

function defineReadOnlyProperties(target, properties) {
  for (let property in properties) {
    Object.defineProperty(target, property, {value: properties[property]});
  }
}
