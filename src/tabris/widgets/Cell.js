import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Cell extends Widget {

  get _nativeType() {
    return 'tabris.Composite';
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
