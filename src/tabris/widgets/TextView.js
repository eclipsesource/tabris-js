import Widget from '../Widget';

const CONFIG = {
  _name: 'TextView',
  _type: 'tabris.TextView',
  _properties: {
    alignment: {type: ['choice', ['left', 'right', 'center']], default: 'left'},
    markupEnabled: {type: 'boolean', default: false}, // TODO: readonly
    lineSpacing: {type: 'number', default: 1},
    selectable: {type: 'boolean', default: false},
    maxLines: {
      type: ['nullable', 'natural'],
      default: null,
      access: {
        set(name, value, options) {
          this._nativeSet(name, value <= 0 ? null : value);
          this._storeProperty(name, value, options);
        }
      }
    },
    text: {type: 'string', default: ''}
  }
};

export default class TextView extends Widget.extend(CONFIG) {}
