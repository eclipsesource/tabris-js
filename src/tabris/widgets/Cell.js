import NativeObject from '../NativeObject';
import Composite from './Composite';

export default class Cell extends Composite {

  dispose() {
    console.warn('CollectionView cells are container-managed, they cannot be disposed of');
  }

}

NativeObject.defineProperties(Cell.prototype, {
  item: {
    readonly: true,
    get(name) {
      return this._getStoredProperty(name);
    }
  },
  itemIndex: {
    readonly: true,
    get(name) {
      return this._getStoredProperty(name);
    }
  }
});
