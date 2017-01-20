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
    input: {
      trigger(event) {
        this.trigger('input', this, event.text, {});
      }
    },
    accept: {
      trigger(event) {
        this.trigger('accept', this, event.text, {});
      }
    },
    select: {
      trigger(event) {
        this.trigger('select', this, event);
      }
    }
  }

};

export default class SearchAction extends Widget.extend(CONFIG) {

  open() {
    this._nativeCall('open', {});
    return this;
  }

}
