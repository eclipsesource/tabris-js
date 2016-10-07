import Widget from '../Widget';

export default Widget.extend({
  _name: 'WebView',

  _type: 'tabris.WebView',

  _events: {
    navigate: {
      trigger(event, name) {
        let intercepted = false;
        event.preventDefault = function() {
          intercepted = true;
        };
        this.trigger(name, this, event);
        return intercepted;
      }
    },
    load: {
      trigger(event) {
        this.trigger('load', this, event);
      }
    },
    download: {
      trigger(event) {
        this.trigger('download', this, event);
      }
    },
    message: {
      trigger(event) {
        this.trigger('message', this, event);
      }
    }
  },

  _properties: {
    url: {type: 'string', nocache: true},
    html: {type: 'string', nocache: true},
    headers: {type: 'any', default: {}},
    initScript: {type: 'string'}
  },

  postMessage(data, targetOrigin) {
    this._nativeCall('postMessage', {
      data,
      origin: targetOrigin
    });
    return this;
  }

});
