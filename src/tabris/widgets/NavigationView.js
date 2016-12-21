import Widget from '../Widget';
import WidgetCollection from '../WidgetCollection';
import Page from './Page';
import Action from './Action';
import SearchAction from './SearchAction';
import {extend} from '../util';

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
    backnavigation: {
      trigger() {
        this.stack.pop();
      }
    }
  },

  _supportsChildren(child) {
    return this.stack.indexOf(child) !== -1 || child instanceof Action || child instanceof SearchAction;
  }

});

function StackView(navigationView) {

  let stack = [];

  Object.defineProperty(this, 'length', {get() {return stack.length;}});

  navigationView.on('back', () => {
    let result = stack.pop();
    result.trigger('disappear', result);
    result._setParent(null);
    let lastPage = this.last();
    if (lastPage) {
      lastPage.trigger('appear', lastPage);
    }
    return result;
  });

  extend(this, {

    push(page) {
      if (!(page instanceof Page)) {
        throw new Error('Only instances of Page can be pushed.');
      }
      if (this.indexOf(page) !== -1) {
        throw new Error('Can not push a page that is already on the stack.');
      }
      let lastPage = this.last();
      if (lastPage) {
        lastPage.trigger('disappear', lastPage);
      }
      stack.push(page);
      navigationView.append(page);
      navigationView._nativeCall('stack_push', {page: page.cid});
      page.trigger('appear', page);
    },

    pop() {
      let result = stack.pop();
      if (result) {
        result.trigger('disappear', result);
        navigationView._nativeCall('stack_pop', {});
        result._setParent(null);
      }
      let lastPage = this.last();
      if (lastPage) {
        lastPage.trigger('appear', lastPage);
      }
      return result;
    },

    clear() {
      let result = new WidgetCollection(stack);
      let lastPage = this.last();
      if (lastPage) {
        lastPage.trigger('disappear', lastPage);
      }
      navigationView._nativeCall('stack_clear', {});
      stack = [];
      result.forEach((page) => {page._setParent(null);});
      return result;
    },

    first() {
      return stack[0];
    },

    last() {
      return stack[stack.length - 1];
    },

    indexOf(page) {
      return stack.indexOf(page);
    }

  });

}
