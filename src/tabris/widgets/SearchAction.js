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

}

NativeObject.defineProperties(SearchAction.prototype, {
  image: {type: 'image', default: null},
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
