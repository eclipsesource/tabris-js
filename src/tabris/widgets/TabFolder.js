import Widget from '../Widget';
import Tab from './Tab';

const CONFIG = {
  _name: 'TabFolder',

  _type: 'tabris.TabFolder',

  _properties: {
    paging: {type: 'boolean', default: false},
    tabBarLocation: {type: ['choice', ['top', 'bottom', 'hidden', 'auto']], default: 'auto'},
    tabMode: {type: ['choice', ['fixed', 'scrollable']], default: 'fixed'},
    selection: {
      access: {
        set(name, tab, options) {
          if (this._children.indexOf(tab) < 0) {
            console.warn('Can not set TabFolder selection to ' + tab);
            return;
          }
          this._nativeSet('selection', tab.cid);
          this.trigger('change:selection', this, tab, options);
        },
        get() {
          let selection = this._nativeGet('selection');
          return selection ? tabris._proxies.find(selection) : null;
        }
      }
    }
  },
  _events: {
    select: {
      trigger(name, event) {
        let tab = tabris._proxies.find(event.selection);
        this.trigger('select', this, tab, {});
      }
    },
    scroll: {
      trigger(name, event) {
        event.selection = event.selection ? tabris._proxies.find(event.selection) : null;
        this.trigger('scroll', this, event);
      }
    }
  }

};

export default class TabFolder extends Widget.extend(CONFIG) {

  _acceptChild(child) {
    return child instanceof Tab;
  }

  _listen(name, listening) {
    if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection(widget, tab) {
    this.trigger('change:selection', this, tab, {});
  }

}
