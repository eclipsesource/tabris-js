import NativeObject from '../NativeObject';
import Composite from './Composite';
import Tab from './Tab';

const EVENT_TYPES = ['select', 'scroll'];

export default class TabFolder extends Composite {

  get _nativeType() {
    return 'tabris.TabFolder';
  }

  _acceptChild(child) {
    return child instanceof Tab;
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'select') {
      let tab = tabris._proxies.find(event.selection);
      return super._trigger('select', {tab});
    }
    if (name === 'scroll') {
      let selection = event.selection ? tabris._proxies.find(event.selection) : null;
      return super._trigger('scroll', {selection, offset: event.offset});
    }
    return super._trigger(name, event);
  }

  $triggerChangeSelection({tab}) {
    this._triggerChangeEvent('selection', tab);
  }

}

NativeObject.defineProperties(TabFolder.prototype, {
  paging: {type: 'boolean', default: false},
  tabBarLocation: {type: ['choice', ['top', 'bottom', 'hidden', 'auto']], default: 'auto'},
  tabMode: {type: ['choice', ['fixed', 'scrollable']], default: 'fixed'},
  selection: {
    set(name, tab) {
      if (this._children.indexOf(tab) < 0) {
        console.warn('Can not set TabFolder selection to ' + tab);
        return;
      }
      this._nativeSet('selection', tab.cid);
      this._triggerChangeEvent('selection', tab);
    },
    get() {
      let selection = this._nativeGet('selection');
      return selection ? tabris._proxies.find(selection) : null;
    }
  }
});
