import Widget from '../Widget';
import WidgetCollection from '../WidgetCollection';
import Page from './Page';
import {extend} from '../util';

export default Widget.extend({

  _name: 'NavigationView',

  _type: 'tabris.NavigationView',

  _create: function() {
    var result = Widget.prototype._create.apply(this, arguments);
    Object.defineProperty(this, 'stack', {value: new StackView(this)});
    this._nativeListen('backnavigation', true);
    return result;
  },

  _properties: {
    drawerActionVisible: {type: 'boolean', default: false}
  },

  _events: {
    backnavigation: {
      trigger: function() {
        this.stack.pop();
      }
    }
  },

  _supportsChildren: function(child) {
    return this.stack.indexOf(child) !== -1;
  }

});

function StackView(navigationView) {

  var stack = [];

  Object.defineProperty(this, 'length', {get: function() {return stack.length;}});

  extend(this, {

    push: function(page) {
      if (!(page instanceof Page)) {
        throw new Error('Only instances of Page can be pushed.');
      }
      if (this.indexOf(page) !== -1) {
        throw new Error('Can not push a page that is already on the stack.');
      }
      stack.push(page);
      navigationView.append(page);
      navigationView._nativeCall('stack_push', {page: page.cid});
    },

    pop: function() {
      var result = stack.pop();
      if (result) {
        navigationView._nativeCall('stack_pop', {});
        result._setParent(null);
      }
      return result;
    },

    clear: function() {
      var result = new WidgetCollection(stack);
      navigationView._nativeCall('stack_clear', {});
      stack = [];
      result.forEach(function(page) {page._setParent(null);});
      return result;
    },

    first: function() {
      return stack[0];
    },

    last: function() {
      return stack[stack.length - 1];
    },

    indexOf: function(page) {
      return stack.indexOf(page);
    }

  });

}
