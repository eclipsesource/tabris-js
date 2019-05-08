import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Picker extends Widget {

  /**
   * @param {Partial<Picker>} properties
   */
  constructor(properties) {
    super(properties);
    tabris.on('flush', this.$flush, this);
    this.on('dispose', () => tabris.off('flush', this.$flush, this));
  }

  get _nativeType() {
    return 'tabris.Picker';
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
      delete this.$needsUpdateItems;
    }
    if (this.$newSelectionIndex >= -1) {
      this._nativeSet('selectionIndex', this.$newSelectionIndex);
      this._triggerChangeEvent('selectionIndex', this.$newSelectionIndex);
      tabris._nativeBridge.flush();
      delete this.$newSelectionIndex;
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
  style: {type: ['choice', ['default', 'outline', 'fill', 'underline', 'none']], const: true, default: 'default'},
  message: {type: 'string', default: ''},
  floatMessage: {type: 'boolean', default: true},
  itemCount: {
    type: 'natural',
    default: 0,
    set(name, value) {
      this._storeProperty(name, value);
      this.$needsUpdateItems = true;
    }
  },
  itemText: {
    type: 'function',
    default: () => () => '',
    set(name, value) {
      this.$needsUpdateItems = true;
      this._storeProperty(name, value);
    }
  },
  selectionIndex: {
    type: 'integer',
    default: -1,
    set(name, value) {
      this.$newSelectionIndex = value;
    },
    get(name) {
      return this.$newSelectionIndex >= -1 ? this.$newSelectionIndex : this._nativeGet(name);
    }
  },
  borderColor: {type: 'ColorValue', default: null},
  textColor: {type: 'ColorValue', default: null},
  font: {type: 'FontValue', default: null}
});

NativeObject.defineEvents(Picker.prototype, {
  select: {native: true, changes: 'selectionIndex', changeValue: 'index'},
});
