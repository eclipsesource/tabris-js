import Widget from '../Widget';

const CONFIG = {

  _name: 'Picker',

  _type: 'tabris.Picker',

  _events: {
    select: {
      alias: 'change:selectionIndex',
      trigger(event) {
        this._triggerChangeEvent('selectionIndex', event.selectionIndex);
        this.trigger('select', this, this._getItem(event.selectionIndex), {index: event.selectionIndex});
      }
    },
    'change:selection': {
      listen(state) {
        if (state) {
          this.on('change:selectionIndex', triggerSelectionChange);
        } else {
          this.off('change:selectionIndex', triggerSelectionChange);
        }
      }
    }
  },

  _properties: {
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
  },

};

export default class Picker extends Widget.extend(CONFIG) {

  _create(properties) {
    let initProperties = ('selection' in properties) ? {} : {selectionIndex: 0};
    super._create(Object.assign(initProperties, properties));
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

}

function triggerSelectionChange(widget, index, options) {
  widget._triggerChangeEvent('selection', widget._getItem(index), Object.assign({index}, options));
}
