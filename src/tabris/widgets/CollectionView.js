import NativeObject from '../NativeObject';
import Widget from '../Widget';
import Cell from './Cell';

const EVENT_TYPES = ['refresh', 'select', 'scroll'];

export default class CollectionView extends Widget {

  constructor(properties) {
    super(Object.assign({items: []}, properties));
    this._nativeListen('requestinfo', true);
    this._nativeListen('createitem', true);
    this._nativeListen('populateitem', true);
    tabris.on('flush', () => this._reload());
  }

  get _nativeType() {
    return 'tabris.CollectionView';
  }

  _acceptChild(child) {
    return child instanceof Cell;
  }

  _setItems(items) {
    this._items = items || [];
    this._triggerChangeEvent('items', this._items);
    this._needsReload = true;
  }

  _getItem(items, index) {
    return items[index];
  }

  reveal(index) {
    index = this._checkIndex(index);
    if (index >= 0 && index < this._items.length) {
      this._nativeCall('reveal', {index});
    }
  }

  refresh(index) {
    if (arguments.length === 0) {
      this._nativeCall('update', {reload: [0, this._items.length]});
      return;
    }
    index = this._checkIndex(index);
    if (index >= 0 && index < this._items.length) {
      this._nativeCall('update', {reload: [index, 1]});
    }
  }

  insert(items, index) {
    if (!Array.isArray(items)) {
      throw new Error('items is not an array');
    }
    if (arguments.length === 1) {
      index = this._items.length;
    } else {
      index = Math.max(0, Math.min(this._items.length, this._checkIndex(index)));
    }
    Array.prototype.splice.apply(this._items, [index, 0].concat(items));
    this._adjustIndicies(index, items.length);
    this._nativeCall('update', {insert: [index, items.length]});
  }

  remove(index, count) {
    index = this._checkIndex(index);
    if (arguments.length === 1) {
      count = 1;
    } else if (typeof count === 'number' && isFinite(count) && count >= 0) {
      count = Math.min(count, this._items.length - index);
    } else {
      throw new Error('illegal remove count');
    }
    if (index >= 0 && index < this._items.length && count > 0) {
      this._items.splice(index, count);
      this._adjustIndicies(index + count, -count);
      this._nativeCall('update', {remove: [index, count]});
    }
  }

  _reload() {
    // We defer the reload call until the end of create/set in order to ensure that
    // we don't receive events before the listeners are attached
    if (this._needsReload) {
      this._nativeCall('reload', {'items': this._items.length});
      delete this._needsReload;
    }
  }

  _checkIndex(index) {
    if (typeof index !== 'number' || !isFinite(index)) {
      throw new Error('illegal index');
    }
    return index < 0 ? index + this._items.length : index;
  }

  _adjustIndicies(offset, diff) {
    let cells = this._children || [];
    for (let i = 0; i < cells.length; i++) {
      let cell = cells[i];
      let itemIndex = cell._getStoredProperty('itemIndex');
      if (itemIndex >= offset) {
        cell._storeProperty('itemIndex', itemIndex + diff);
      }
    }
  }

  _listen(name, listening) {
    if (name === 'change:firstVisibleIndex') {
      this._onoff('scroll', listening, triggerChangeFirstVisibleIndex);
    } else if (name === 'change:lastVisibleIndex') {
      this._onoff('scroll', listening, triggerChangeLastVisibleIndex);
    } else if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'requestinfo') {
      let item = this._getItem(this._items, event.index);
      let type = resolveProperty(this, 'cellType', item);
      let height = resolveProperty(this, 'itemHeight', item, type);
      let typeId = encodeCellType(this, type);
      let description = {index: event.index, type: typeId, height};
      this._nativeCall('describeItem', description);
      return description;
    } else if (name === 'createitem') {
      let cell = new Cell();
      cell._parent = this;
      this._addChild(cell);
      this._nativeCall('addItem', {widget: cell.cid});
      let initializeCell = this.initializeCell;
      if (typeof initializeCell !== 'function') {
        console.warn('initializeCell callback missing');
      } else {
        initializeCell(cell, decodeCellType(this, event.type));
      }
      return cell.cid;
    } else if (name === 'populateitem') {
      let cell = tabris._proxies.find(event.widget);
      let item = this._getItem(this._items, event.index);
      cell._storeProperty('itemIndex', event.index);
      if (item !== cell._getStoredProperty('item')) {
        cell._storeProperty('item', item);
      } else {
        cell._triggerChangeEvent('item', item);
      }
    } else if (name === 'select') {
      let item = this._getItem(this._items, event.index);
      return super._trigger('select', {item, index: event.index});
    } else {
      return super._trigger(name, event);
    }
  }

}

NativeObject.defineProperties(CollectionView.prototype, {
  itemHeight: {
    type: 'any', // "function|natural",
    default: 0,
    set(name, value) {
      if (typeof value !== 'function') {
        // Required for 1.0 compatibility
        this._nativeSet('itemHeight', value);
      }
      this._storeProperty(name, value);
    }
  },
  items: {
    type: 'array',
    set(name, value) {
      this._setItems(value);
    },
    get() {
      return this._items;
    }
  },
  initializeCell: {
    type: 'function',
    default: null,
    set(name, value) {
      this._storeProperty(name, value);
    }
  },
  cellType: {
    type: 'any', // "string|function",
    default: null,
    set(name, value) {
      this._storeProperty(name, value);
    }
  },
  refreshEnabled: {type: 'boolean', default: false},
  refreshIndicator: {type: 'boolean', nocache: true},
  refreshMessage: {type: 'string', default: ''},
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
  return cellTypes[type];
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
