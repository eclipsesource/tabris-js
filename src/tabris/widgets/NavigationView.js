import Widget from '../Widget';
import Page from './Page';
import Action from './Action';
import SearchAction from './SearchAction';

const CONFIG = {

  _name: 'NavigationView',

  _type: 'tabris.NavigationView',

  _properties: {
    drawerActionVisible: {type: 'boolean', default: false},
    toolbarVisible: {type: 'boolean', default: true},
    toolbarColor: {type: 'color'},
    titleTextColor: {type: 'color'},
    actionColor: {type: 'color'},
    actionTextColor: {type: 'color'},
    animated: {type: 'boolean', default: true}
  },

  _events: {
    back: {
      trigger() {
        this._handleBackNavigation();
      }
    },
    backnavigation: {
      trigger() {
        this._handleBackNavigation();
      }
    }
  },

  _supportsChildren(child) {
    return child instanceof Page || child instanceof Action || child instanceof SearchAction;
  }

};

export default class NavigationView extends Widget.extend(CONFIG) {

  _create() {
    let result = Widget.prototype._create.apply(this, arguments);
    this._nativeListen('backnavigation', true);
    this._nativeListen('back', true);
    return result;
  }

  _addChild(child, index) {
    if (child instanceof Page) {
      if (typeof index === 'number' && index !== this.pages().length) {
        throw new Error('Cannot append a page at the given position');
      }
      this._triggerDisappear();
    }
    Widget.prototype._addChild.apply(this, arguments);
    if (child instanceof Page) {
      this._triggerAppear();
    }
  }

  _removeChild(child) {
    if (child instanceof Page) {
      if (!this.pages().includes(child)) {
        return;
      }
      // TODO remove iOS only stack_ calls
      if (this.pages().length > 1 && child === this.pages().first()) {
        this._nativeCall('stack_clear', {});
      }
      this._triggerDisappear();
      this._popPagesAbove(child);
      if (!this._inPopAbove) {
      }
    }
    Widget.prototype._removeChild.apply(this, arguments);
    if (child instanceof Page) {
      this._triggerAppear();
    }
  }

  _handleBackNavigation() {
    this._pop(this.pages().last());
  }

  _popPagesAbove(page) {
    if (this._inPopAbove) {
      return;
    }
    this._inPopAbove = true;
    let pages = this.pages();
    let index = pages.indexOf(page);
    if (index !== -1) {
      for (let i = pages.length - 1; i > index; i--) {
        this._pop(pages[i]);
      }
    }
    delete this._inPopAbove;
  }

  _pop(page) {
    if (page && page.autoDispose) {
      page.dispose();
    } else if (page) {
      page._setParent(null);
    }
  }

  _triggerAppear() {
    if (this._inPopAbove) {
      return;
    }
    let topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('appear', topPage);
    }
  }

  _triggerDisappear() {
    if (this._inPopAbove) {
      return;
    }
    let topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('disappear', topPage);
    }
  }

  pages() {
    return this.children().filter(child => child instanceof Page);
  }

}
