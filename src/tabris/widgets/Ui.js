import Widget from '../Widget';
import {create as createContentView} from './ContentView';
import {create as createStatusBar} from './StatusBar';
import {create as createNavigationBar} from './NavigationBar';
import {create as createDrawer} from './Drawer';

const CONFIG = {
  _name: 'Ui',
  _type: 'tabris.Ui',
  _properties: {
    win_theme: {
      type: ['choice', ['default', 'light', 'dark']],
      default: 'light'
    }
  }
};

export default class Ui extends Widget.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('Ui can not be created');
    }
  }

  _create(type, properties) {
    super._create(type, properties);
    this._appendNamedChild('contentView', createContentView());
    this._appendNamedChild('statusBar', createStatusBar());
    this._appendNamedChild('navigationBar', createNavigationBar());
    this._appendNamedChild('drawer', createDrawer());
    return this;
  }

  _acceptChild(child) {
    return child === this.contentView
        || child === this.statusBar
        || child === this.navigationBar
        || child === this.drawer;
  }

  _appendNamedChild(name, child) {
    Object.defineProperty(this, name, {value: child});
    this.append(child);
  }

  _setParent() {
    throw new Error('Parent of tabris.ui can not be changed');
  }

  _dispose() {
    throw new Error('Ui can not be disposed');
  }

}

export function create() {
  return new Ui(true);
}
