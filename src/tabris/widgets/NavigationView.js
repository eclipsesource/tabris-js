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
      this._triggerDisappear();
    }
    super._addChild(child, index);
    if (isTopPage) {
      this._triggerAppear();
    }
  }

  _removeChild(child) {
    let isTopPage = (child instanceof Page && child === this.pages().last());
    if (isTopPage) {
      this._triggerDisappear();
    }
    super._removeChild(child);
    if (isTopPage) {
      this._triggerAppear();
    }
  }

  _handleBackNavigation() {
    this._pop(this.pages().last());
  }

  _pop(page) {
    if (page && page.autoDispose) {
      page.dispose();
    } else if (page) {
      page._setParent(null);
    }
  }

  _listen(name, listening) {
    if (name === 'topToolbarHeightChanged') {
      this._nativeListen('change_topToolbarHeight', listening);
    } else if (name === 'bottomToolbarHeightChanged') {
      this._nativeListen('change_bottomToolbarHeight', listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'backNavigation') {
      this._handleBackNavigation();
    } else if (name === 'change_topToolbarHeight') {
      this._triggerChangeEvent('topToolbarHeight', event.value);
    } else if (name === 'change_bottomToolbarHeight') {
      this._triggerChangeEvent('bottomToolbarHeight', event.value);
    } else {
      return super._trigger(name, event);
    }
  }

  _triggerAppear() {
    let topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('appear', {target: topPage});
    }
  }

  _triggerDisappear() {
    let topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('disappear', {target: topPage});
    }
  }

  pages() {
    return this.children().filter(child => child instanceof Page);
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
  pageAnimation: {type: ['choice', ['default', 'none']], default: 'default'},
  win_toolbarTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  win_toolbarOverflowTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  win_drawerActionTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  win_drawerActionBackground: {type: 'color'}
});
