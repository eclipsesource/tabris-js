export default function ClientStub() {
  this._calls = [];
  this._objects = {};
}

ClientStub.prototype = {

  create() {
    let [id, type, properties] = arguments;
    this._calls.push({op: 'create', id, type, properties});
    this._objects[id] = {type, properties};
  },

  get() {
    let [id, property] = arguments;
    this._calls.push({op: 'get', id, property});
  },

  set() {
    let [id, properties] = arguments;
    this._calls.push({op: 'set', id, properties});
    if (!(id in this._objects)) {
      this._objects[id] = {properties: {}};
    }
    Object.assign(this._objects[id].properties, properties);
  },

  call() {
    let [id, method, parameters] = arguments;
    this._calls.push({op: 'call', id, method, parameters});
  },

  listen() {
    let [id, event, listen] = arguments;
    this._calls.push({op: 'listen', id, event, listen});
  },

  destroy() {
    let [id] = arguments;
    this._calls.push({op: 'destroy', id});
    delete this._objects[id];
  },

  load(url) {
    return url.slice(-5) === '.json' ? '{}' : 'exports = 23;';
  },

  calls(filterProperties) {
    tabris._nativeBridge.flush();
    return select.call(this._calls, filterProperties);
  },

  resetCalls() {
    tabris._nativeBridge.flush();
    this._calls = [];
  },

  properties(id) {
    if (!(id in this._objects)) {
      throw new Error('No object with id ' + id);
    }
    return this._objects[id].properties;
  }

};

function select(filterProperties) {
  return this.filter((call) => {
    for (let key in filterProperties) {
      if (filterProperties[key] !== call[key]) {
        return false;
      }
    }
    return true;
  });
}
