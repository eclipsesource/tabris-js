export default class ClientStub {

  constructor() {
    this.$calls = [];
    this.$objects = {};
  }

  create() {
    let [id, type, properties] = arguments;
    this.$calls.push({op: 'create', id, type, properties});
    this.$objects[id] = {type, properties};
  }

  get() {
    let [id, property] = arguments;
    this.$calls.push({op: 'get', id, property});
  }

  set() {
    let [id, properties] = arguments;
    this.$calls.push({op: 'set', id, properties});
    if (!(id in this.$objects)) {
      this.$objects[id] = {properties: {}};
    }
    Object.assign(this.$objects[id].properties, properties);
  }

  call() {
    let [id, method, parameters] = arguments;
    this.$calls.push({op: 'call', id, method, parameters});
  }

  listen() {
    let [id, event, listen] = arguments;
    this.$calls.push({op: 'listen', id, event, listen});
  }

  destroy() {
    let [id] = arguments;
    this.$calls.push({op: 'destroy', id});
    delete this.$objects[id];
  }

  load(url) {
    return url.slice(-5) === '.json' ? '{}' : 'exports = 23;';
  }

  calls(filterProperties) {
    tabris._nativeBridge.flush();
    return select.call(this.$calls, filterProperties);
  }

  resetCalls() {
    tabris._nativeBridge.flush();
    this.$calls = [];
  }

  properties(id) {
    if (!(id in this.$objects)) {
      throw new Error('No object with id ' + id);
    }
    return this.$objects[id].properties;
  }

}

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
