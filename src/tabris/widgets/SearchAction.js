import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class SearchAction extends Widget {

  get _nativeType() {
    return 'tabris.SearchAction';
  }

  open() {
    this._nativeCall('open', {});
    return this;
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes().concat([['title', this.title]]);
    if (this.text) {
      result.push(['text', this.text]);
    }
    if (this.message) {
      result.push(['message', this.message]);
    }
    return result;
  }

}

NativeObject.defineProperties(SearchAction.prototype, {
  image: {type: 'ImageValue', default: null},
  placementPriority: {type: ['choice', ['low', 'high', 'normal']], default: 'normal'},
  title: {type: 'string', default: ''},
  proposals: {default() {return [];}},
  text: {type: 'string', nocache: true},
  message: {type: 'string', default: ''}
});

NativeObject.defineEvents(SearchAction.prototype, {
  input: {native: true},
  accept: {native: true},
  select: {native: true}
});
