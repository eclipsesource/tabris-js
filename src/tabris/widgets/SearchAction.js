import Widget from '../Widget';

const CONFIG = {
  _name: 'SearchAction',
  _type: 'tabris.SearchAction',
  _properties: {
    image: {type: 'image', default: null},
    placementPriority: {type: ['choice', ['low', 'high', 'normal']], default: 'normal'},
    title: {type: 'string', default: ''},
    proposals: {default() {return [];}},
    text: {type: 'string', nocache: true},
    message: {type: 'string', default: ''}
  },
  _events: {
    input: true,
    accept: true,
    select: true
  }
};

export default class SearchAction extends Widget.extend(CONFIG) {

  open() {
    this._nativeCall('open', {});
    return this;
  }

}
