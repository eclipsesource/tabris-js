import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

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
  image: {type: types.ImageValue, default: null},
  placementPriority: {
    type: types.string,
    choice: ['low', 'high', 'normal'],
    default: 'normal'
  },
  title: {type: types.string, default: ''},
  proposals: {
    type: {
      convert(value) {
        if (!Array.isArray(value)) {
          throw new Error('Not an array');
        }
        return Object.freeze(value.map(types.string.convert));
      }
    },
    default: Object.freeze([])
  },
  text: {type: types.string, nocache: true},
  message: {type: types.string, default: ''}
});

NativeObject.defineEvents(SearchAction.prototype, {
  input: {native: true},
  accept: {native: true},
  select: {native: true}
});
