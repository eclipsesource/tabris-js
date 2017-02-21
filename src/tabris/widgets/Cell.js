import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Cell extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Composite', properties);
  }

  dispose() {
    console.warn('CollectionView cells are container-managed, they cannot be disposed of');
  }

  _acceptChild() {
    return true;
  }

}

NativeObject.defineProperties(Cell.prototype, {
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
});
