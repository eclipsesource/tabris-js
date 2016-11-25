import Widget from '../Widget';
import {create as createContentView} from './ContentView';
import {create as createStatusBar} from './StatusBar';
import {create as createNavigationBar} from './NavigationBar';
import {create as createDrawer} from './Drawer';

export default function Ui() {
  throw new Error('Ui can not be created');
}

let _Ui = Widget.extend({

  _name: 'Ui',
  _type: 'tabris.Ui',

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
    throw new Error('Ui can not be disposed');
  }

});

Ui.prototype = _Ui.prototype;

export function create() {
  return new _Ui();
}
