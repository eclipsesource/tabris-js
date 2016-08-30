export default function ProxyStore() {
  this._idSequence = 1;
  this._proxies = {};
}

ProxyStore.prototype = {

  register: function(proxy, withcid) {
    var cid = withcid || this._generateId();
    if (cid in this._proxies) {
      throw new Error("cid already in use: " + cid);
    }
    this._proxies[cid] = proxy;
    return cid;
  },

  remove: function(cid) {
    delete this._proxies[cid];
  },

  find: function(cid) {
    return this._proxies[cid] || null;
  },

  _generateId: function() {
    return "o" + (this._idSequence++);
  }

};


