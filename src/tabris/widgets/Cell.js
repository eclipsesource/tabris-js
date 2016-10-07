import Widget from '../Widget';

export default Widget.extend({
  _name: 'Cell',

  _type: 'tabris.Composite',

  _supportsChildren: true,

  dispose() {
    console.warn('CollectionView cells are container-managed, they cannot be disposed of');
  },

  _properties: {
    item: {
      access: {
        set() {
          // read only
        },
        get(name) {
          return this._getStoredProperty(name);
        }
      }
    },
    itemIndex: {
      access: {
        set() {
          // read only
        },
        get(name) {
          return this._getStoredProperty(name);
        }
      }
    }
  }

});
