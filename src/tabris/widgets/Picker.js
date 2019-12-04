import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';
import {pick, omit} from '../util';

export default class Picker extends Widget {

  /**
   * @param {Partial<Picker>} properties
   */
  constructor(properties) {
    super(pick(properties, ['style']));
    Object.defineProperties(this, {
      _itemCount: {enumerable: false, writable: true, value: 0},
      _itemText: {enumerable: false, writable: true, value: () => ''}
    });
    this.set(omit(properties, ['style']));
    tabris.on('flush', this.$flush, this);
    this.on('dispose', () => tabris.off('flush', this.$flush, this));
  }

  get _nativeType() {
    return 'tabris.Picker';
  }

  set itemCount(value) {
    try {
      const oldValue = this._itemCount;
      this._itemCount = types.natural.convert(value);
      if (this._itemCount !== oldValue) {
        Object.defineProperty(this, '$needsUpdateItems', {enumerable: false, writable: true, value: true});
        this._triggerChangeEvent('itemCount');
      }
    } catch (ex) {
      this._printPropertyWarning('itemCount', ex);
    }
  }

  get itemCount() {
    return this._itemCount;
  }

  set itemText(value) {
    try {
      if (!(value instanceof Function)) {
        throw new Error('Not a Function');
      }
      const oldValue = this._itemText;
      this._itemText = value;
      if (this._itemText !== oldValue) {
        Object.defineProperty(this, '$needsUpdateItems', {
          enumerable: false, writable: true, value: true
        });
        this._triggerChangeEvent('itemText');
      }
    } catch (ex) {
      this._printPropertyWarning('itemText', ex);
    }
  }

  get itemText() {
    return this._itemText;
  }

  set selectionIndex(value) {
    try {
      const oldValue = this.$newSelectionIndex;
      this.$newSelectionIndex = types.integer.convert(value);
      if (this.$newSelectionIndex !== oldValue) {
        this._triggerChangeEvent('selectionIndex');
      }
    } catch (ex) {
      this._printPropertyWarning('selectionIndex', ex);
    }
  }

  get selectionIndex() {
    return this.$newSelectionIndex >= -1 ? this.$newSelectionIndex : this._nativeGet('selectionIndex');
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([
      ['itemCount', this.itemCount],
      ['selectionIndex', this.selectionIndex]
    ]);
  }

  $flush() {
    if (this.$needsUpdateItems) {
      const items = new Array(this.itemCount);
      for (let index = 0; index < items.length; index++) {
        items[index] = this.itemText(index) + '';
      }
      this._nativeSet('items', items);
      tabris._nativeBridge.flush();
      this.$needsUpdateItems = false;
    }
    if (this.$newSelectionIndex >= -1) {
      this._nativeSet('selectionIndex', this.$newSelectionIndex);
      this._triggerChangeEvent('selectionIndex', this.$newSelectionIndex);
      tabris._nativeBridge.flush();
      this.$newSelectionIndex = undefined;
    }
  }

  _trigger(name, event) {
    if (name === 'select') {
      return super._trigger('select', {index: event.selectionIndex});
    }
    return super._trigger(name, event);
  }

}

NativeObject.defineProperties(Picker.prototype, {
  style: {
    type: types.string,
    choice: ['default', 'outline', 'fill', 'underline', 'none'],
    const: true,
    default: 'default'
  },
  message: {type: types.string, default: ''},
  floatMessage: {type: types.boolean, default: true},
  borderColor: {type: types.ColorValue, default: null},
  textColor: {type: types.ColorValue, default: null},
  font: {type: types.FontValue, default: null}
});

NativeObject.defineChangeEvents(Picker.prototype, [
  'selectionIndex',
  'itemText',
  'itemCount'
]);

NativeObject.defineEvents(Picker.prototype, {
  select: {
    native: true,
    changes: 'selectionIndex',
    changeValue: ev => 'index' in ev ? ev.index : ev.selectionIndex
  },
});
