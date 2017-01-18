import Widget from '../Widget';
import Page from './Page';
import Action from './Action';
import SearchAction from './SearchAction';

export default Widget.extend({

  _name: 'NavigationView',

  _type: 'tabris.NavigationView',

  _create() {
    let result = Widget.prototype._create.apply(this, arguments);
    Object.defineProperty(this, 'stack', {value: new StackView(this)});
    this._nativeListen('backnavigation', true);
    this._nativeListen('back', true);
    return result;
  },

  _properties: {
    drawerActionVisible: {type: 'boolean', default: false},
    toolbarVisible: {type: 'boolean', default: true},
    toolbarColor: {type: 'color'},
    titleTextColor: {type: 'color'},
    actionColor: {type: 'color'},
    actionTextColor: {type: 'color'}
  },

  _events: {
    back: {
      trigger() {
        this._handleBackNavigation(true);
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
  },

  _addChild(child, index) {
    if (child instanceof Page) {
      if (typeof index === 'number' && index !== this.pages().length) {
        throw new Error('Cannot append a page at the given position');
      }
      // TODO remove iOS only stack_ calls
      this._nativeCall('stack_push', {page: child.cid});
      this._triggerDisappear();
    }
    Widget.prototype._addChild.apply(this, arguments);
    if (child instanceof Page) {
      this._triggerAppear();
    }
  },

  _removeChild(child) {
    if (child instanceof Page) {
      if (!this.pages().includes(child)) {
        return;
      }
      // TODO remove iOS only stack_ calls
      if (this.pages().length > 1 && child === this.pages().first()) {
        this._nativeCall('stack_clear', {});
        this._skipPopCalls = true;
      } else if (!this._skipPopCalls) {
        this._nativeCall('stack_pop', {});
      }
      this._triggerDisappear();
      this._popPagesAbove(child);
      if (!this._inPopAbove) {
        delete this._skipPopCalls;
      }
    }
    Widget.prototype._removeChild.apply(this, arguments);
    if (child instanceof Page) {
      this._triggerAppear();
    }
  },

  _handleBackNavigation(skipPopCalls) {
    this._skipPopCalls = skipPopCalls;
    this._pop(this.pages().last());
    delete this._skipPopCalls;
  },

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
  },

  _pop(page) {
    if (page && page.autoDispose) {
      page.dispose();
    } else if (page) {
      page._setParent(null);
    }
  },

  _triggerAppear() {
    if (this._inPopAbove) {
      return;
    }
    let topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('appear', topPage);
    }
  },

  _triggerDisappear() {
    if (this._inPopAbove) {
      return;
    }
    let topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('disappear', topPage);
    }
  },

  pages() {
    return this.children().filter(child => child instanceof Page);
  }

});

/**
 * TODO Temporary stub for backwards compatibility, remove
 */
class StackView {

  constructor(parent) {
    this._parent = parent;
  }

  get length() {
    return this._parent.pages().length;
  }

  indexOf(page) {
    return this._parent.pages().indexOf(page);
  }

  first() {
    return this._parent.pages().first();
  }

  last() {
    return this._parent.pages().last();
  }

  push(page) {
    this._parent.append(page);
  }

  pop() {
    let page = this._parent.pages().last();
    this._parent._pop(page);
    return page;
  }

  clear() {
    let pages = this._parent.pages();
    this._parent._pop(pages.first());
    return pages;
  }

}
