import NativeObject from '../NativeObject';
import Composite from './Composite';

export default class Cell extends Composite {

  dispose() {
    console.warn('CollectionView cells are container-managed, they cannot be disposed of');
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
