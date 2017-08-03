import NativeObject from '../NativeObject';
import Widget from '../Widget';
import Composite from './Composite';

const EVENT_TYPES = ['refresh', 'select', 'scroll'];

export default class CollectionView extends Composite {

  constructor(properties) {
    super(properties);
    this._nativeListen('requestInfo', true);
    this._nativeListen('createCell', true);
    this._nativeListen('updateCell', true);
    tabris.on('flush', this.$flush, this);
    this.on('dispose', () => tabris.off('flush', this.$flush, this));
  }

  get _nativeType() {
    return 'tabris.CollectionView';
  }

  load(itemCount) {
    if (!isNumber(itemCount) || itemCount < 0) {
      throw new Error('Invalid itemCount');
    }
    this._storeProperty('itemCount', itemCount);
    this._nativeCall('load', {itemCount});
  }

  reveal(index) {
    index = this.$checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this.$flush();
      this._nativeCall('reveal', {index});
    }
  }

  refresh(index) {
    if (arguments.length === 0) {
      this.$flush();
      this._nativeCall('refresh', {index: 0, count: this.itemCount});
      return;
    }
    index = this.$checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this.$flush();
      this._nativeCall('refresh', {index, count: 1});
    }
  }

  insert(index, count = 1) {
    index = Math.min(Math.max(0, this.$checkIndex(index)), this.itemCount);
    if (!isNumber(count) || count <= 0) {
      throw new Error('Invalid insert count');
    }
    this._storeProperty('itemCount', this.itemCount + count);
    this.$flush();
    this._nativeCall('insert', {index, count});
  }

  remove(index, count = 1) {
    index = this.$checkIndex(index);
    if (isNumber(count) && count >= 0) {
      count = Math.min(count, this.itemCount - index);
    } else {
      throw new Error('Invalid remove count');
    }
    if (index >= 0 && index < this.itemCount && count > 0) {
      this._storeProperty('itemCount', this.itemCount - count);
      this.$flush();
      this._nativeCall('remove', {index, count});
    }
  }

  $flush() {
    // Load new items if needed after all properties have been set
    // to avoid intercepting the aggregation of properties in set.
    if (this._needsReload) {
      delete this._needsReload;
      this._nativeCall('load', {itemCount: this.itemCount});
    }
  }

  $checkIndex(index) {
    if (!isNumber(index)) {
      throw new Error('Invalid index');
    }
    return index < 0 ? index + this.itemCount : index;
  }

  _listen(name, listening) {
    if (name === 'firstVisibleIndexChanged') {
      this._onoff('scroll', listening, triggerChangeFirstVisibleIndex);
    } else if (name === 'lastVisibleIndexChanged') {
      this._onoff('scroll', listening, triggerChangeLastVisibleIndex);
    } else if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'requestInfo') {
      let type = resolveProperty(this, 'cellType', event.index);
      let height = resolveProperty(this, 'cellHeight', event.index, type);
      return {
        type: encodeCellType(this, type),
        height: encodeCellHeight(height)
      };
    } else if (name === 'createCell') {
      let item = this.$createCell(event.type);
      return item.cid;
    } else if (name === 'updateCell') {
      this.updateCell(tabris._proxies.find(event.widget), event.index);
    } else if (name === 'select') {
      return super._trigger('select', {index: event.index});
    } else {
      return super._trigger(name, event);
    }
  }

  $createCell(type) {
    let cell = this.createCell(decodeCellType(this, type));
    if (!(cell instanceof Widget)) {
      throw new Error('Created cell is not a widget');
    }
    if (cell._parent) {
      throw new Error('Created cell already has a parent');
    }
    cell._parent = this;
    this._addChild(cell);
    cell._setParent = () => console.warn('Cannot re-parent collection view cell');
    cell.dispose = () => console.warn('Cannot dispose of collection view cell');
    return cell;
  }

}

NativeObject.defineProperties(CollectionView.prototype, {
  itemCount: {
    type: 'natural',
    default: 0,
    set(name, value) {
      this._storeProperty(name, value);
      this._needsReload = true;
    }
  },
  cellType: {
    type: 'any', // string|function,
    default: null,
    set(name, value) {
      if (value !== this.cellType) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  cellHeight: {
    type: 'any', // natural|auto|function
    default: 'auto',
    set(name, value) {
      if (value !== this.cellHeight) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  createCell: {
    type: 'function',
    default: () => () => new Composite(),
    set(name, value) {
      if (value !== this.createCell) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  updateCell: {
    type: 'function',
    default: () => () => {},
    set(name, value) {
      if (value !== this.updateCell) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  refreshEnabled: {
    type: 'boolean',
    default: false
  },
  refreshIndicator: {
    type: 'boolean',
    nocache: true
  },
  refreshMessage: {
    type: 'string',
    default: ''
  },
  firstVisibleIndex: {
    type: 'number',
    readonly: true
  },
  lastVisibleIndex: {
    type: 'number',
    readonly: true
  },
  columnCount: {
    type: 'number',
    default: 1
  }
});

function resolveProperty(ctx, name) {
  let value = ctx[name];
  if (typeof value === 'function') {
    return value.apply(null, Array.prototype.slice.call(arguments, 2));
  }
  return value;
}

function encodeCellType(ctx, type) {
  let cellTypes = ctx._cellTypes || (ctx._cellTypes = []);
  let index = cellTypes.indexOf(type);
  if (index === -1) {
    index += cellTypes.push(type);
  }
  return index;
}

function decodeCellType(ctx, type) {
  let cellTypes = ctx._cellTypes || [];
  return cellTypes[type] || null;
}

function encodeCellHeight(value) {
  if (value === 'auto') {
    return -1;
  }
  if (isNumber(value)) {
    return Math.max(-1, value);
  }
  console.warn('Invalid cell height: ' + value);
}

let triggerChangeFirstVisibleIndex = createDelegate('firstVisibleIndex');
let triggerChangeLastVisibleIndex = createDelegate('lastVisibleIndex');

function createDelegate(prop) {
  return function() {
    let actual = this.get(prop);
    if (actual !== this['_prev:' + prop]) {
      this._triggerChangeEvent(prop, actual);
    }
    this['_prev:' + prop] = actual;
  };
}

function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}
