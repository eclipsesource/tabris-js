import Widget from '../Widget';
import {create as createContentView} from './ContentView';
import {create as createStatusBar} from './StatusBar';
import {create as createNavigationBar} from './NavigationBar';
import {create as createDrawer} from './Drawer';

export default function UI() {
  throw new Error('UI can not be created');
}

let _UI = Widget.extend({

  _name: 'UI',
  _type: 'tabris.UI',

  _create() {
    let result = this._super('_create', arguments);
    this._appendNamedChild('contentView', createContentView());
    this._appendNamedChild('statusBar', createStatusBar());
    this._appendNamedChild('navigationBar', createNavigationBar());
    this._appendNamedChild('drawer', createDrawer());
    return result;
  },

  _appendNamedChild(name, child) {
    Object.defineProperty(this, name, {value: child});
    this.append(child);
  },

  _setParent() {
    throw new Error('Parent of tabris.ui can not be changed');
  },

  _supportsChildren(child) {
    return child === this.contentView
      || child === this.statusBar
      || child === this.navigationBar
      || child === this.drawer;
  },

  _dispose() {
    throw new Error('UI can not be disposed');
  }

});

UI.prototype = _UI.prototype;

export function create() {
  return new _UI();
}
