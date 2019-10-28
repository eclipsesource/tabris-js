import NativeObject from '../NativeObject';
import Composite from './Composite';
import Tab from './Tab';
import {JSX} from '../JsxProcessor';
import {omit, pick} from '../util';
import {types} from '../property-types';
import {toValueString, hint} from '../Console';

export default class TabFolder extends Composite {

  /**
   * @param {Partial<TabFolder>=} properties
   */
  constructor(properties) {
    super(properties);
    Object.defineProperty(this, '$previousSelection', {
      enumerable: false, writable: true, value: undefined
    });
    this._nativeListen('select', true);
  }

  get _nativeType() {
    return 'tabris.TabFolder';
  }

  set selectionIndex(index) {
    const children = this._children();
    if (!children[index]) {
      hint(this, 'Can not set selectionIndex to ' + index + ', value out of bounds');
      return;
    }
    this.selection = children[index];
  }

  get selectionIndex() {
    return this._children().indexOf(this.selection);
  }

  _scheduleRenderChildren() {
    // Skip the queue mechanism to avoid tab selection-before-appended issue
    this.$flushChildren();
  }

  _nativeListen(event, state) {
    if (event === 'select' && !state) {
      return;
    }
    super._nativeListen(event, state);
  }

  _initLayout() {
    Object.defineProperty(this, '_layout', {enumerable: false, writable: false, value: null});
  }

  _acceptChild(child) {
    return child instanceof Tab;
  }

  _addChild(child, index) {
    super._addChild(child, index);
    if (this.$children.indexOf(child) === 0) {
      child.$trigger('appear');
      this.$previousSelection = child;
    }
  }

  _removeChild(child) {
    if (!this._inDispose) {
      const childIndex = this.$children.indexOf(child);
      const rightNeighbor = this.$children[childIndex + 1];
      const leftNeighbor = this.$children[childIndex - 1];
      const newSelection = rightNeighbor || leftNeighbor;
      if (newSelection) {
        this.selection = newSelection;
      } else {
        this._triggerChangeEvent('selection', null);
      }
    }
    super._removeChild(child);
  }

  _listen(name, listening) {
    if (name === 'selectionIndexChanged') {
      this._onoff('selectionChanged', listening, this.$triggerSelectionIndexChanged);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'select') {
      const selection = tabris._nativeObjectRegistry.find(event.selection);
      const result = super._trigger('select', {selection});
      selection._trigger('select');
      if (this.$previousSelection === selection) {
        selection._trigger('reselect');
      }
      this._triggerChangeEvent('selection', selection);
      return result;
    }
    if (name === 'scroll') {
      const selection = event.selection ? tabris._nativeObjectRegistry.find(event.selection) : null;
      return super._trigger('scroll', {selection, offset: event.offset});
    }
    return super._trigger(name, event);
  }

  _triggerChangeEvent(name, value) {
    if (name === 'selection') {
      if (this.$previousSelection !== value) {
        super._triggerChangeEvent(name, value);
        if (this.$previousSelection) {
          this.$previousSelection._trigger('disappear');
        }
        if (value) {
          value._trigger('appear');
        }
        this.$previousSelection = value;
      }
    } else {
      super._triggerChangeEvent(name, value);
    }
  }

  _getXMLAttributes() {
    const tab = this.selection;
    return super._getXMLAttributes().concat([
      ['selection', tab ? tab.toString() : '']
    ]);
  }

  $triggerSelectionIndexChanged({value: tab}) {
    super._triggerChangeEvent('selectionIndex', this._children().indexOf(tab));
  }

}

NativeObject.defineProperties(TabFolder.prototype, {
  paging: {type: types.boolean, default: false},
  tabBarLocation: {
    choice: ['top', 'bottom', 'hidden', 'auto'],
    default: 'auto',
    const: true
  },
  tabMode: {
    type: types.string,
    choice: ['fixed', 'scrollable'],
    default: 'fixed',
    const: true
  },
  selection: {
    type: {
      convert(value, tabFolder) {
        const tab = types.Widget.convert(value);
        if (!tab || !(tab instanceof Tab) || tabFolder._children().indexOf(tab) < 0) {
          throw new Error('Can not set selection to ' + toValueString(value));
        }
        return tab;
      },
      encode: types.Widget.encode,
      decode(value, tabFolder) {
        if (!tabFolder._children().length) {
          return null;
        }
        return types.Widget.decode(value);
      }
    },
    nocache: true
  },
  tabTintColor: {type: types.ColorValue, default: 'initial'},
  selectedTabTintColor: {type: types.ColorValue, default: 'initial'},
  tabBarBackground: {type: types.ColorValue, default: 'initial'},
  tabBarElevation: {type: types.number, nocache: true},
  selectedTabIndicatorTintColor: {type: types.ColorValue, default: 'initial'}
});

NativeObject.defineChangeEvents(TabFolder.prototype, [
  'selectionIndex'
]);

NativeObject.defineEvents(TabFolder.prototype, {
  scroll: {native: true},
  select: {native: true}
});

TabFolder.prototype[JSX.jsxFactory] = createElement;

/** @this {import("../JsxProcessor").default} */
function createElement(Type, attributes) {
  const result = Composite.prototype[JSX.jsxFactory].call(
    this,
    Type,
    omit(attributes, ['selection', 'selectionIndex'])
  );
  result.set(pick(attributes, ['selection', 'selectionIndex']));
  return result;
}
