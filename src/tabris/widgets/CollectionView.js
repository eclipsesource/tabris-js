import NativeObject from '../NativeObject';
import Widget from '../Widget';
import Composite from './Composite';

const EVENT_TYPES = ['refresh', 'select', 'scroll'];

export default class CollectionView extends Composite {

  constructor(properties) {
    super(properties);
    this._nativeListen('requestinfo', true);
    this._nativeListen('createitem', true);
    this._nativeListen('populateitem', true);
    tabris.on('flush', this._reload, this);
    this.on('dispose', () => tabris.off('flush', this._reload, this));
  }

  get _nativeType() {
    return 'tabris.CollectionView';
  }

  reveal(index) {
    index = this._checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this._nativeCall('reveal', {index});
    }
  }

  refresh(index) {
    if (arguments.length === 0) {
      this._nativeCall('update', {reload: [0, this.itemCount]});
      return;
    }
    index = this._checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this._nativeCall('update', {reload: [index, 1]});
    }
  }

  insert(index, count = 1) {
    index = Math.min(Math.max(0, this._checkIndex(index)), this.itemCount);
    if (!isNumber(count) || count <= 0) {
      throw new Error('Invalid insert count');
    }
    this._storeProperty('itemCount', this.itemCount + count);
    this._nativeCall('update', {insert: [index, count]});
  }

  remove(index, count = 1) {
    index = this._checkIndex(index);
    if (isNumber(count) && count >= 0) {
      count = Math.min(count, this.itemCount - index);
    } else {
      throw new Error('Invalid remove count');
    }
    if (index >= 0 && index < this.itemCount && count > 0) {
      this._storeProperty('itemCount', this.itemCount - count);
      this._nativeCall('update', {remove: [index, count]});
    }
  }

  _reload() {
    // We defer the reload call until the end of create/set in order to ensure that
    // we don't receive events before the listeners are attached
    if (this._needsReload) {
      delete this._needsReload;
      this._nativeCall('reload', {'items': this.itemCount});
    }
  }

  _checkIndex(index) {
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
    if (name === 'requestinfo') {
      let type = resolveProperty(this, 'cellType', event.index);
      let height = resolveProperty(this, 'cellHeight', event.index, type);
      let typeId = encodeCellType(this, type);
      return {type: typeId, height};
    } else if (name === 'createitem') {
      let item = this._createCell(event.type);
      return item.cid;
    } else if (name === 'populateitem') {
      this.updateCell(tabris._proxies.find(event.widget), event.index);
    } else if (name === 'select') {
      return super._trigger('select', {index: event.index});
    } else {
      return super._trigger(name, event);
    }
  }

  _createCell(type) {
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
      if (value !== this.itemCount) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  cellType: {
    type: 'any', // "string|function",
    default: null,
    set(name, value) {
      if (value !== this.cellType) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  cellHeight: {
    type: 'any', // "function|natural",
    default: 0,
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
  let value = ctx.get(name);
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
