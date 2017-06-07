export default class ProxyStore {

  constructor() {
    this.$idSequence = 1;
    this.$proxies = {};
  }

  register(proxy) {
    let cid = this.$generateId();
    if (cid in this.$proxies) {
      throw new Error('cid already in use: ' + cid);
    }
    this.$proxies[cid] = proxy;
    return cid;
  }

  remove(cid) {
    delete this.$proxies[cid];
  }

  find(cid) {
    return this.$proxies[cid] || null;
  }

  $generateId() {
    return 'o' + (this.$idSequence++);
  }

}
