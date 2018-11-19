import NativeObject from '../NativeObject';
import Composite from './Composite';
import Page from './Page';
import Action from './Action';
import SearchAction from './SearchAction';

export default class NavigationView extends Composite {

  constructor(properties) {
    super(properties);
    this._nativeListen('backNavigation', true);
  }

  get _nativeType() {
    return 'tabris.NavigationView';
  }

  _initLayout() {
    this._layout = null;
  }

  _acceptChild(child) {
    return child instanceof Page || child instanceof Action || child instanceof SearchAction;
  }

  _addChild(child, index) {
    const isTopPage = (child instanceof Page && typeof index !== 'number' || index === this.pages().length);
    if (isTopPage) {
      this.$triggerDisappear();
    }
    super._addChild(child, index);
    if (isTopPage) {
      this.$triggerAppear();
    }
  }

  _removeChild(child) {
    const isTopPage = (child instanceof Page && child === this.pages().last());
    if (isTopPage) {
      this.$triggerDisappear();
    }
    super._removeChild(child);
    if (isTopPage) {
      this.$triggerAppear();
    }
  }

  $handleBackNavigation() {
    this.$pop(this.pages().last());
  }

  $pop(page) {
    if (page && page.autoDispose) {
      page.dispose();
    } else if (page) {
      page._setParent(null);
    }
  }

  _listen(name, listening) {
    if (name === 'toolbarHeightChanged') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'backNavigation') {
      this.$handleBackNavigation();
    } else if (name === 'toolbarHeightChanged') {
      this._triggerChangeEvent('toolbarHeight', event.toolbarHeight);
    } else {
      return super._trigger(name, event);
    }
  }

  $triggerAppear() {
    const topPage = this.pages().last();
    if (topPage) {
      topPage.$trigger('appear');
    }
  }

  $triggerDisappear() {
    const topPage = this.pages().last();
    if (topPage) {
      topPage.$trigger('disappear');
    }
  }

  pages(selector) {
    return this.children(selector).filter(child => child instanceof Page);
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    if (!this.drawerActionVisible) {
      result.push(['drawerActionVisible', 'false']);
    }
    if (!this.toolbarVisible) {
      result.push(['toolbarVisible', 'false']);
    }
    return result;
  }

}

NativeObject.defineProperties(NavigationView.prototype, {
  drawerActionVisible: {type: 'boolean', default: false},
  toolbarVisible: {type: 'boolean', default: true},
  toolbarColor: {type: 'ColorValue'},
  toolbarHeight: {readonly: true},
  titleTextColor: {type: 'ColorValue'},
  actionColor: {type: 'ColorValue'},
  actionTextColor: {type: 'ColorValue'},
  navigationAction: {type: 'NativeObject', default: null},
  pageAnimation: {type: ['choice', ['default', 'none']], default: 'default'}
});

NativeObject.defineEvents(NavigationView.prototype, {
  backNavigation: true
});
