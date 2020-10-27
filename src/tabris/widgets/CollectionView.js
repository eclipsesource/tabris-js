import NativeObject from '../NativeObject';
import Widget from '../Widget';
import Composite from './Composite';
import {hint, toValueString} from '../Console';
import {types} from '../property-types';

export default class CollectionView extends Composite {

  /**
   * @param {Partial<CollectionView>} properties
   */
  constructor(properties) {
    super();
    Object.defineProperties(this, {
      _needsReload: {
        enumerable: false,
        writable: true,
        value: false
      },
      _updateCell: {
        enumerable: false,
        writable: true,
        value: (/** @type {(cell: Widget) => void} */(() => {}))
      },
      _itemCount: {
        enumerable: false,
        writable: true,
        value: (/** @type {number} */(0))
      },
      _createCell: {
        enumerable: false,
        writable: true,
        value: (/** @type {(item: any) => Widget} */(() => new Composite()))
      },
      _cellHeight: {
        enumerable: false,
        writable: true,
        value: (/** @type {number|'auto'|((item: any) => number)} */('auto'))
      },
      _cellType: {
        enumerable: false,
        writable: true,
        value: (/** @type {string|((item: any) => string)} */(null))
      },
      _cellMapping: {
        enumerable: false,
        writable: true,
        value: (/** @type {Map<Widget, number>} */(new Map()))
      },
      _itemMapping: {
        enumerable: false,
        writable: true,
        value: (/** @type {Map<number, Widget>} */(new Map()))
      }
    });
    this.set(properties || {});
    this._nativeListen('requestInfo', true);
    this._nativeListen('createCell', true);
    this._nativeListen('updateCell', true);
    tabris.on('flush', this.$flush, this);
    this.on('dispose', () => tabris.off('flush', this.$flush, this));
  }

  get _nativeType() {
    return 'tabris.CollectionView';
  }

  set itemCount(value) {
    try {
      const oldValue = this._itemCount;
      this._itemCount = types.natural.convert(value);
      // explicit requirement by tests to do this even if the value is unchanged:
      this._needsReload = true;
      if (oldValue !== this._itemCount) {
        this._triggerChangeEvent('itemCount', this._itemCount);
      }
    } catch (ex) {
      this._printPropertyWarning('itemCount', ex);
    }
  }

  get itemCount() {
    return this._itemCount;
  }

  set cellType(value) {
    if (value === null || typeof value === 'string' || value instanceof Function) {
      if (value !== this._cellType) {
        this._cellType = value;
        this._needsReload = true;
        this._triggerChangeEvent('cellType', this._itemCount);
      }
    } else {
      this._printPropertyWarning('cellType', new Error('Not a string or function'));
    }
  }

  get cellType() {
    return this._cellType;
  }

  set cellHeight(value) {
    try {
      const oldValue = this._cellHeight;
      if (value === 'auto' || value instanceof Function) {
        this._cellHeight = value;
      } else {
        this._cellHeight = types.dimension.convert(value);
      }
      if (oldValue !== this._cellHeight) {
        this._needsReload = true;
        this._triggerChangeEvent('cellHeight', this._cellHeight);
      }
    } catch (ex) {
      this._printPropertyWarning('cellHeight', ex);
    }
  }

  get cellHeight() {
    return this._cellHeight;
  }

  /** @type {(item: any) => Widget} */
  set createCell(value) {
    if (value instanceof Function) {
      if (value !== this._createCell) {
        this._createCell = value;
        this._needsReload = true;
        this._triggerChangeEvent('createCell', this._createCell);
      }
    } else {
      this._printPropertyWarning('createCell', new Error('Not a function'));
    }
  }

  get createCell() {
    return this._createCell;
  }

  /** @type {(cell: Widget) => void} */
  set updateCell(value) {
    if (value instanceof Function) {
      if (this._updateCell !== value) {
        this._updateCell = value;
        this._needsReload = true;
        this._triggerChangeEvent('updateCell', this._updateCell);
      }
    } else {
      this._printPropertyWarning('updateCell', new Error('Not a function'));
    }
  }

  get updateCell() {
    return this._updateCell;
  }

  load(itemCount) {
    if (!isNumber(itemCount) || itemCount < 0) {
      throw new Error(`Invalid itemCount ${toValueString(itemCount)}`);
    }
    this._itemCount = itemCount;
    this._needsReload = true;
  }

  reveal(index, options) {
    index = this.$checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this.$flush();
      this._nativeCall('reveal', {
        index,
        animate: options && 'animate' in options ? !!options.animate : true,
        offset: options && 'offset' in options ? options.offset : null
      });
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
      throw new Error(`Invalid insert count ${toValueString(count)}`);
    }
    this._itemCount = this.itemCount + count;
    this.$flush();
    for (let i = index; i < index + count; i++) {
      this._itemMapping.delete(i);
    }
    for (const cell of this._children()) {
      const oldIndex = this._cellMapping.get(cell);
      if (oldIndex >= index) {
        const newIndex = oldIndex + count;
        this._cellMapping.set(cell, newIndex);
        this._itemMapping.set(newIndex, cell);
      }
    }
    this._nativeCall('insert', {index, count});
  }

  remove(index, count = 1) {
    index = this.$checkIndex(index);
    if (isNumber(count) && count >= 0) {
      count = Math.min(count, this.itemCount - index);
    } else {
      throw new Error(`Invalid remove count ${toValueString(count)}`);
    }
    if (index >= 0 && index < this.itemCount && count > 0) {
      this._itemCount = this.itemCount - count;
      this.$flush();
      for (let i = this._itemCount; i < this.itemCount + count; i++) {
        this._itemMapping.delete(i);
      }
      for (const cell of this._children()) {
        const oldIndex = this._cellMapping.get(cell);
        if (oldIndex >= index) {
          if (oldIndex < index + count) {
            this._cellMapping.delete(cell);
            this._itemMapping.delete(oldIndex);
          } else {
            const newIndex = oldIndex - count;
            this._cellMapping.set(cell, newIndex);
            this._itemMapping.set(newIndex, cell);
          }
        }
      }
      this._nativeCall('remove', {index, count});
    }
  }

  /**
   * @param {Widget} widget
   * @returns {number}
   */
  itemIndex(widget) {
    if (!(widget instanceof Widget)) {
      throw new Error(`${toValueString(widget)} is not a widget`);
    }
    let cell = widget;
    while (cell && cell.parent() !== this) {
      cell = cell.parent();
    }
    if (!cell) {
      throw new Error(`${toValueString(widget)} not a cell or child of a cell`);
    }
    if (this._cellMapping.has(cell)) {
      return this._cellMapping.get(cell);
    }
    return -1;
  }

  /**
   * @param {number} index
   * @returns {Widget}
   */
  cellByItemIndex(index) {
    if (!isNumber(index) || index < 0) {
      throw new Error(`${toValueString(index)} is not a valid index`);
    }
    if (this._itemMapping.has(index)) {
      return this._itemMapping.get(index);
    }
    return null;
  }

  set layout(value) {
    if (value) {
      this._printPropertyWarning('layout', new Error('CollectionView does not support layouts'));
    }
  }

  get layout() {
    return null;
  }

  _listen(name, listening) {
    if (name === 'firstVisibleIndexChanged') {
      this._onoff('scroll', listening, triggerChangeFirstVisibleIndex);
    } else if (name === 'lastVisibleIndexChanged') {
      this._onoff('scroll', listening, triggerChangeLastVisibleIndex);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'requestInfo') {
      const type = resolveProperty(this, 'cellType', event.index);
      const height = resolveProperty(this, 'cellHeight', event.index, type);
      return {
        type: encodeCellType(this, type),
        height: encodeCellHeight(this, height)
      };
    } else if (name === 'createCell') {
      const item = this.$createCell(event.type);
      return item.cid;
    } else if (name === 'updateCell') {
      const cell = tabris._nativeObjectRegistry.find(event.widget);
      if (this._cellMapping.has(cell)) {
        this._itemMapping.delete(this._cellMapping.get(cell));
      }
      this._cellMapping.set(cell, event.index);
      this._itemMapping.set(event.index, cell);
      this.updateCell(cell, event.index);
    } else {
      return super._trigger(name, event);
    }
  }

  _initLayout() {}

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([
      ['itemCount', this.itemCount],
      ['firstVisibleIndex', this.firstVisibleIndex]
    ]);
  }

  $checkIndex(index) {
    if (!isNumber(index)) {
      throw new Error(`${toValueString(index)} is not a valid index`);
    }
    return index < 0 ? index + this.itemCount : index;
  }

  $flush() {
    // Load new items if needed after all properties have been set
    // to avoid intercepting the aggregation of properties in set.
    if (this._needsReload) {
      this._needsReload = false;
      this._nativeCall('load', {itemCount: this.itemCount});
    }
  }

  $createCell(type) {
    const cell = this.createCell(decodeCellType(this, type));
    if (!(cell instanceof Widget)) {
      throw new Error(`Created cell ${toValueString(cell)} is not a widget`);
    }
    if (cell._parent) {
      throw new Error(`Created cell ${toValueString(cell)} already has a parent`);
    }
    cell._parent = this;
    this._addChild(cell);
    cell._setParent = () => hint(this, 'Cannot re-parent collection view cell');
    cell.dispose = () => hint(this, 'Cannot dispose of collection view cell');
    return cell;
  }

}

NativeObject.defineProperties(CollectionView.prototype, {
  refreshEnabled: {
    type: types.boolean,
    default: false
  },
  refreshIndicator: {
    type: types.boolean,
    nocache: true
  },
  refreshMessage: {
    type: types.string,
    default: ''
  },
  firstVisibleIndex: {
    type: types.number,
    readonly: true,
    nocache: true
  },
  lastVisibleIndex: {
    type: types.number,
    readonly: true,
    nocache: true
  },
  columnCount: {
    type: types.number,
    default: 1
  },
  scrollbarVisible: {
    type: types.boolean,
    default: true
  }
});

NativeObject.defineEvents(CollectionView.prototype, {
  refresh: {native: true},
  scroll: {native: true}
});

NativeObject.defineChangeEvents(CollectionView.prototype, [
  'createCell',
  'cellType',
  'cellHeight',
  'itemCount',
  'updateCell'
]);

function resolveProperty(ctx, name) {
  const value = ctx[name];
  if (typeof value === 'function') {
    return value.apply(null, Array.prototype.slice.call(arguments, 2));
  }
  return value;
}

function encodeCellType(ctx, type) {
  const cellTypes = ctx._cellTypes || (ctx._cellTypes = []);
  let index = cellTypes.indexOf(type);
  if (index === -1) {
    index += cellTypes.push(type);
  }
  return index;
}

function decodeCellType(ctx, type) {
  const cellTypes = ctx._cellTypes || [];
  return cellTypes[type] || null;
}

function encodeCellHeight(ctx, value) {
  if (value === 'auto') {
    return -1;
  }
  if (isNumber(value)) {
    return Math.max(-1, value);
  }
  hint(ctx, 'Invalid cell height: ' + value);
}

const triggerChangeFirstVisibleIndex = createDelegate('firstVisibleIndex');
const triggerChangeLastVisibleIndex = createDelegate('lastVisibleIndex');

function createDelegate(prop) {
  return function() {
    // eslint-disable-next-line no-invalid-this
    const instance = this;
    const actual = instance[prop];
    if (actual !== instance['_prev:' + prop]) {
      instance._triggerChangeEvent(prop, actual);
    }
    instance['_prev:' + prop] = actual;
  };
}

function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}
