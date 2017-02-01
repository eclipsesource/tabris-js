import Widget from '../Widget';

const CONFIG = {

  _name: 'Cell',

  _type: 'tabris.Composite',

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

};

export default class Cell extends Widget.extend(CONFIG) {

  dispose() {
    console.warn('CollectionView cells are container-managed, they cannot be disposed of');
  }

  _acceptChild() {
    return true;
  }

}
