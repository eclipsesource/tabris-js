import Widget from '../Widget';

const CONFIG = {

  _name: 'Action',

  _type: 'tabris.Action',

  _properties: {
    image: {type: 'image', default: null},
    placementPriority: {
      type: ['choice', ['low', 'high', 'normal']],
      access: {
        set(name, value, options) {
          this._nativeSet(name, value.toUpperCase());
          this._storeProperty(name, value, options);
        }
      },
      default: 'normal'
    },
    title: {type: 'string', default: ''},
    win_symbol: {type: 'string', default: ''}
  },

  _events: {
    select: true
  }

};

export default class Action extends Widget.extend(CONFIG) {}
