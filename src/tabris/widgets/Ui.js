import Composite from './Composite';
import NativeObject from '../NativeObject';
import {create as createContentView} from './ContentView';
import {create as createStatusBar} from './StatusBar';
import {create as createNavigationBar} from './NavigationBar';
import {create as createDrawer} from './Drawer';

export default class Ui extends Composite {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('Ui can not be created');
    }
    super();
    let contentView = createContentView();
    contentView._nativeSet('root', true);
    this.$appendNamedChild('contentView', contentView);
    this.$appendNamedChild('statusBar', createStatusBar());
    this.$appendNamedChild('navigationBar', createNavigationBar());
    this.$appendNamedChild('drawer', createDrawer());
  }

  get _nativeType() {
    return 'tabris.Ui';
  }

  _acceptChild(child) {
    return child === this.contentView
        || child === this.statusBar
        || child === this.navigationBar
        || child === this.drawer;
  }

  $appendNamedChild(name, child) {
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

NativeObject.defineProperties(Ui.prototype, {
  win_theme: {
    type: ['choice', ['default', 'light', 'dark']],
    default: 'light'
  }
});
