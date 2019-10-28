export default class NativeObjectRegistry {

  constructor() {
    Object.defineProperties(this, {
      $idSequence: {enumerable: false, writable: true, value: 1},
      $objects: {enumerable: false, writable: false, value: {}}
    });
  }

  register(nativeObject) {
    const cid = this.$generateId();
    if (cid in this.$objects) {
      throw new Error('cid already in use: ' + cid);
    }
    this.$objects[cid] = nativeObject;
    return cid;
  }

  remove(cid) {
    delete this.$objects[cid];
  }

  find(cid) {
    return this.$objects[cid] || null;
  }

  $generateId() {
    return '$' + (this.$idSequence++);
  }

}
