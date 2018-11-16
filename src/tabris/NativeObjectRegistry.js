export default class NativeObjectRegistry {

  constructor() {
    this.$idSequence = 1;
    this.$objects = {};
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
