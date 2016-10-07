import Widget from '../Widget';
import {create as createContentView} from './ContentView';

export default function UI() {
  throw new Error('UI can not be created');
}

let _UI = Widget.extend({

  _name: 'UI',

  _create: function() {
    Object.defineProperty(this, 'contentView', {
      value: createContentView(),
      writable: false,
      configurable: false
    });
    this.append(this.contentView);
  },

  _setParent: function() {
    throw new Error('Parent of ContentView can not be changed');
  },

  _nativeSet: function() {},

  _nativeGet: function() {},

  _nativeCall: function() {},

  _nativeListen: function() {},

  _supportsChildren: function(child) {
    if (child === this.contentView) {
      return true;
    }
    return false;
  },

  _dispose: function() {
    throw new Error('UI can not be disposed');
  }

});

UI.prototype = _UI.prototype;

export function create() {
  return new _UI();
}
