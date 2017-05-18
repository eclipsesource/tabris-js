import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Picker extends Widget {

  constructor(properties) {
    super(Object.assign({selectionIndex: 0}, properties));
    tabris.on('flush', this._update, this);
    this.on('dispose', () => tabris.off('flush', this._update, this));
  }

  get _nativeType() {
    return 'tabris.Picker';
  }

  _update() {
    if (this.$needsUpdateItems) {
      let items = new Array(this.itemCount);
      for (let index = 0; index < items.length; index++) {
        items[index] = this.itemText(index);
      }
      this._nativeSet('items', items);
      delete this.$needsUpdateItems;
    }
    if (this.$newSelectionIndex >= 0) {
      this._nativeSet('selectionIndex', this.$newSelectionIndex);
      this._triggerChangeEvent('selectionIndex', this.$newSelectionIndex);
      delete this.$newSelectionIndex;
    }
  }

  _listen(name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'selectionIndexChanged') {
      this._onoff('select', listening, this.$triggerSelectionIndexChanged);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'select') {
      return super._trigger('select', {index: event.selectionIndex});
    }
    return super._trigger(name, event);
  }

  $triggerSelectionIndexChanged({index}) {
    this._triggerChangeEvent('selectionIndex', index);
  }

}

NativeObject.defineProperties(Picker.prototype, {
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
    type: 'natural',
    default: 0,
    set(name, value) {
      this.$newSelectionIndex = value;
    },
    get(name) {
      return this._nativeGet(name);
    }
  },
  fillColor: {type: 'color'},
  borderColor: {type: 'color'},
  textColor: {type: 'color'}
});
