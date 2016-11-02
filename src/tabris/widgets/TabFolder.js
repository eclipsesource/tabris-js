import Widget from '../Widget';

export default Widget.extend({
  _name: 'TabFolder',

  _type: 'tabris.TabFolder',

  _properties: {
    paging: {type: 'boolean', default: false},
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
    },
    tabBarLocation: {type: ['choice', ['top', 'bottom', 'hidden', 'auto']], default: 'auto'}
  },

  _events: {
    select: {
      alias: 'change:selection',
      trigger(event) {
        let tab = tabris._proxies.find(event.selection);
        this.trigger('change:selection', this, tab, {});
        this.trigger('select', this, tab, {});
      }
    },
    scroll: {
      trigger(event) {
        event.selection = event.selection ? tabris._proxies.find(event.selection) : null;
        this.trigger('scroll', this, event);
      }
    }
  },

  _supportsChildren(child) {
    return child.type === 'Tab';
  }

});
