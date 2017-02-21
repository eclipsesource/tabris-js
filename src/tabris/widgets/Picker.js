import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Picker extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Picker', properties);
  }

  _create(type, properties = {}) {
    let initProperties = ('selection' in properties) ? {} : {selectionIndex: 0};
    super._create(type, Object.assign(initProperties, properties));
    return this;
  }

  _reorderProperties(properties) {
    // items property depends on itemText, selection/selectionIndex depend on items
    let deferred = ['items', 'selection', 'selectionIndex'];
    return properties.filter(name => deferred.indexOf(name) === -1)
      .concat(deferred.filter(name => properties.indexOf(name) !== -1));
  }

  _getItem(index) {
    return this.get('items')[index];
  }

  _getItemIndex(item) {
    return this.get('items').indexOf(item);
  }

  _listen(name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else if (name === 'change:selectionIndex') {
      this._onoff('select', listening, this.$triggerChangeSelectionIndex);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'select') {
      this.trigger('select', {target: this, item: this._getItem(event.selectionIndex), index: event.selectionIndex});
    } else {
      super._trigger(name, event);
    }
  }

  $triggerChangeSelection({item}) {
    this._triggerChangeEvent('selection', item);
  }

  $triggerChangeSelectionIndex({index}) {
    this._triggerChangeEvent('selectionIndex', index);
  }

}

NativeObject.defineProperties(Picker.prototype, {
  items: {
    type: 'array',
    default() {
      return [];
    },
    access: {
      set(name, value, options) {
        this._storeProperty(name, value, options);
        let getText = this.get('itemText');
        this._nativeSet('items', value.map(getText));
      }
    }
  },
  itemText: {
    type: 'function',
    default() {
      return function(item) {
        return item == null ? '' : item.toString();
      };
    },
    access: {
      set(name, value, options) {
        this._storeProperty(name, value, options);
      }
    }
  },
  selectionIndex: {
    type: 'natural',
    access: {
      set(name, value, options) {
        this._nativeSet(name, value);
        this._triggerChangeEvent(name, value, options);
      }
    }
  },
  selection: {
    access: {
      set(name, item, options) {
        let index = this._getItemIndex(item);
        if (index !== -1) {
          this.set('selectionIndex', index, options);
          this._triggerChangeEvent(name, item);
        } else {
          console.warn('Could not set picker selection ' + item + ': item not found');
        }
      },
      get() {
        return this._getItem(this.get('selectionIndex'));
      }
    }
  },
  fillColor: {type: 'color'},
  borderColor: {type: 'color'}
});
