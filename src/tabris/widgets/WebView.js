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

  _getXMLContent() {
    let content = super._getXMLContent();
    if (this.html) {
      content = content.concat(this.html.split('\n').map(line => '  ' + line));
    }
    return content;
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    if (this.url) {
      result.push(['url', this.url]);
    }
    return result;
  }

}

NativeObject.defineProperties(WebView.prototype, {
  url: {type: 'string', nocache: true},
  html: {type: 'string', nocache: true},
  headers: {type: 'any', default: Object.freeze({})},
  canGoBack: {type: 'boolean', readonly: true},
  canGoForward: {type: 'boolean', readonly: true},
  initScript: {type: 'string', default: null, nullable: true}
});

NativeObject.defineEvents(WebView.prototype, {
  load: {native: true},
  message: {native: true}
});
