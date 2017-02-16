import Widget from '../Widget';

const CONFIG = {

  _name: 'WebView',

  _type: 'tabris.WebView',

  _events: {
    navigate: true,
    load: true,
    download: true,
    message: true
  },

  _properties: {
    url: {type: 'string', nocache: true},
    html: {type: 'string', nocache: true},
    headers: {type: 'any', default: {}},
    initScript: {type: 'string'}
  }

};

export default class WebView extends Widget.extend(CONFIG) {

  postMessage(data, targetOrigin) {
    this._nativeCall('postMessage', {
      data,
      origin: targetOrigin
    });
    return this;
  }

  _loadData(data, mimeType) {
    this._nativeCall('loadData', {data, mimeType});
  }

  _trigger(name, event) {
    if (name === 'navigate') {
      let intercepted = false;
      Object.assign(event, {
        target: this,
        preventDefault() {
          intercepted = true;
        }
      });
      this.trigger(name, event);
      return intercepted;
    } else {
      super._trigger(name, event);
    }
  }

}
