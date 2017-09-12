import Widget from '../Widget';
import NativeObject from '../NativeObject';

const EVENT_TYPES = ['navigate', 'load', 'download', 'message'];

export default class WebView extends Widget {

  get _nativeType() {
    return 'tabris.WebView';
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  postMessage(data, targetOrigin) {
    this._nativeCall('postMessage', {
      data,
      origin: targetOrigin
    });
    return this;
  }

  goBack() {
    this._nativeCall('goBack');
  }

  goForward() {
    this._nativeCall('goForward');
  }

  _loadData(data, mimeType) {
    this._nativeCall('loadData', {data, mimeType});
  }

}

NativeObject.defineProperties(WebView.prototype, {
  url: {type: 'string', nocache: true},
  html: {type: 'string', nocache: true},
  headers: {type: 'any', default: {}},
  canGoBack: {type: 'boolean', readonly: true},
  canGoForward: {type: 'boolean', readonly: true},
  initScript: {type: 'string'}
});
