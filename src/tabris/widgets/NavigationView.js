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

  _acceptChild(child) {
    return child instanceof Page || child instanceof Action || child instanceof SearchAction;
  }

  _addChild(child, index) {
    let isTopPage = (child instanceof Page && typeof index !== 'number' || index === this.pages().length);
    if (isTopPage) {
      this.$triggerDisappear();
    }
    super._addChild(child, index);
    if (isTopPage) {
      this.$triggerAppear();
    }
  }

  _removeChild(child) {
    let isTopPage = (child instanceof Page && child === this.pages().last());
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
    if (name === 'topToolbarHeightChanged' || name === 'bottomToolbarHeightChanged') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'backNavigation') {
      this.$handleBackNavigation();
    } else if (name === 'topToolbarHeightChanged') {
      this._triggerChangeEvent('topToolbarHeight', event.topToolbarHeight);
    } else if (name === 'bottomToolbarHeightChanged') {
      this._triggerChangeEvent('bottomToolbarHeight', event.bottomToolbarHeight);
    } else {
      return super._trigger(name, event);
    }
  }

  $triggerAppear() {
    let topPage = this.pages().last();
    if (topPage) {
      topPage.$trigger('appear');
    }
  }

  $triggerDisappear() {
    let topPage = this.pages().last();
    if (topPage) {
      topPage.$trigger('disappear');
    }
  }

  pages(selector) {
    return this.children(selector).filter(child => child instanceof Page);
  }

}

NativeObject.defineProperties(NavigationView.prototype, {
  drawerActionVisible: {type: 'boolean', default: false},
  toolbarVisible: {type: 'boolean', default: true},
  toolbarColor: {type: 'color'},
  topToolbarHeight: {readonly: true},
  bottomToolbarHeight: {readonly: true},
  titleTextColor: {type: 'color'},
  actionColor: {type: 'color'},
  actionTextColor: {type: 'color'},
  navigationAction: {type: 'proxy', default: null},
  pageAnimation: {type: ['choice', ['default', 'none']], default: 'default'}
});

NativeObject.defineEvents(NavigationView.prototype, {
  backNavigation: true
});
