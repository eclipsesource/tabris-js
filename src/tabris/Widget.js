import {extend, extendPrototype} from './util';
import Layout from './Layout';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import GestureRecognizer from './GestureRecognizer';
import {animate} from './Animation';
import {types} from './property-types';

export default function Widget() {
  throw new Error('Cannot instantiate abstract Widget');
}

let superProto = NativeObject.prototype;

Widget.prototype = extendPrototype(NativeObject, {

  append() {
    this._checkDisposed();
    let accept = (widget) => {
      if (!(widget instanceof NativeObject)) {
        throw new Error('Cannot append non-widget');
      }
      widget._setParent(this);
    };
    if (arguments[0] instanceof WidgetCollection) {
      arguments[0].toArray().forEach(accept);
    } else if (Array.isArray(arguments[0])) {
      arguments[0].forEach(accept);
    } else {
      Array.prototype.forEach.call(arguments, accept);
    }
    return this;
  },

  appendTo(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot append to non-widget');
    }
    this._setParent(widget);
    return this;
  },

  insertBefore(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot insert before non-widget');
    }
    let parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert before orphan');
    }
    let index = parent._children.indexOf(widget);
    this._setParent(parent, index);
    return this;
  },

  insertAfter(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot insert after non-widget');
    }
    let parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert after orphan');
    }
    let index = parent._children.indexOf(widget);
    this._setParent(parent, index + 1);
    return this;
  },

  parent() {
    return this._parent || null;
  },

  children(selector) {
    return new WidgetCollection(this._getSelectableChildren(), selector);
  },

  siblings(selector) {
    let siblings = (this._parent ? this._parent._getSelectableChildren() : []);
    let filtered = siblings.filter(widget => widget !== this);
    return new WidgetCollection(filtered, selector);
  },

  find(selector) {
    return new WidgetCollection(this._getSelectableChildren(), selector, true);
  },

  apply(sheet) {
    let scope = new WidgetCollection(this._children.concat(this), '*', true);
    if (sheet['*']) {
      scope.set(sheet['*']);
    }
    for (let selector in sheet) {
      if (selector !== '*' && selector[0] !== '#' && selector[0] !== '.') {
        scope.filter(selector).set(sheet[selector]);
      }
    }
    for (let selector in sheet) {
      if (selector[0] === '.') {
        scope.filter(selector).set(sheet[selector]);
      }
    }
    for (let selector in sheet) {
      if (selector[0] === '#') {
        scope.filter(selector).set(sheet[selector]);
      }
    }
    return this;
  },

  _getContainer() {
    return this;
  },

  _getSelectableChildren() {
    return this._children;
  },

  _setParent(parent, index) {
    this._nativeSet('parent', parent ? types.proxy.encode(parent._getContainer(this)) : null);
    if (this._parent) {
      this._parent._removeChild(this);
      Layout.addToQueue(this._parent);
    }
    this._parent = parent;
    if (this._parent) {
      this._parent._addChild(this, index);
      Layout.addToQueue(this._parent);
    }
  },

  _addChild(child, index) {
    let check = this.constructor._supportsChildren;
    if (check === false) {
      throw new Error(this.type + ' cannot contain children');
    }
    if (typeof check === 'function' && !check.call(this, child)) {
      throw new Error(this.type + ' cannot contain children of type ' + child.type);
    }
    if (!this._children) {
      this._children = [];
    }
    if (typeof index === 'number') {
      this._children.splice(index, 0, child);
      this.trigger('addchild', this, child, {index});
    } else {
      this._children.push(child);
      this.trigger('addchild', this, child, {index: this._children.length - 1});
    }
  },

  _removeChild(child) {
    if (this._children) {
      let index = this._children.indexOf(child);
      if (index !== -1) {
        this._children.splice(index, 1);
        this.trigger('removechild', this, child, {index});
      }
    }
  },

  _release() {
    if (this._children) {
      let children = this._children.concat();
      for (let i = 0; i < children.length; i++) {
        children[i]._dispose(true);
      }
      delete this._children;
    }
    if (this._parent) {
      this._parent._removeChild(this);
      Layout.addToQueue(this._parent);
      delete this._parent;
    }
  },

  _getEventConfig(type) {
    let result = superProto._getEventConfig.apply(this, arguments);
    if (!result && this.get('gestures')[type]) {
      return getGestureEventConfig(type);
    }
    return result;
  },

  _flushLayout() {
    if (this._children) {
      this._children.forEach((child) => {
        renderLayoutData.call(child);
      });
    }
  },

  animate

});

Widget.extend = function(members) {
  members = extend({}, members);
  members._events = extend({}, defaultEvents, members._events || {});
  if (members._properties !== true) {
    members._properties = extend({}, defaultProperties, members._properties || {});
  }
  return NativeObject.extend(members, Widget);
};

Object.defineProperty(Widget.prototype, 'classList', {
  get() {
    if (!this._classList) {
      this._classList = [];
    }
    return this._classList;
  }
});

let layoutAccess = {
  set(name, value) {
    if (!this._layoutData) {
      this._layoutData = {};
    }
    if (value == null) {
      delete this._layoutData[name];
    } else {
      this._layoutData[name] = value;
    }
    if (this._parent) {
      Layout.addToQueue(this._parent);
    }
  },
  get(name) {
    return this._layoutData && this._layoutData[name] != null ? this._layoutData[name] : null;
  }
};

function hasAndroidResizeBug() {
  if (!('cache' in hasAndroidResizeBug)) {
    hasAndroidResizeBug.cache = tabris.device.platform === 'Android' && tabris.device.version <= 17;
  }
  return hasAndroidResizeBug.cache;
}

let defaultEvents = {
  touchstart: {trigger: triggerWithTarget},
  touchmove: {trigger: triggerWithTarget},
  touchend: {trigger: triggerWithTarget},
  touchcancel: {trigger: triggerWithTarget},
  'resize': {
    alias: 'change:bounds',
    trigger(event) {
      if (hasAndroidResizeBug()) {
        let self = this;
        setTimeout(() => {
          self._triggerChangeEvent('bounds', event.bounds, {}, 'resize');
          self.trigger('resize', self, types.bounds.decode(event.bounds), {});
        }, 0);
      } else {
        this._triggerChangeEvent('bounds', event.bounds, {}, 'resize');
        this.trigger('resize', this, types.bounds.decode(event.bounds), {});
      }
    }
  }
};

let defaultProperties = {
  enabled: {
    type: 'boolean',
    default: true
  },
  visible: {
    type: 'boolean',
    default: true
  },
  layoutData: {
    type: 'layoutData',
    access: {
      set(name, value) {
        this._layoutData = value;
        if (this._parent) {
          Layout.addToQueue(this._parent);
        }
      },
      get() {
        return this._layoutData || null;
      }
    }
  },
  left: {type: 'edge', access: layoutAccess},
  right: {type: 'edge', access: layoutAccess},
  top: {type: 'edge', access: layoutAccess},
  bottom: {type: 'edge', access: layoutAccess},
  width: {type: 'dimension', access: layoutAccess},
  height: {type: 'dimension', access: layoutAccess},
  centerX: {type: 'dimension', access: layoutAccess},
  centerY: {type: 'dimension', access: layoutAccess},
  baseline: {type: 'sibling', access: layoutAccess},
  elevation: {
    type: 'number',
    default: 0
  },
  font: {
    type: 'font',
    access: {
      set(name, value, options) {
        this._nativeSet(name, value === undefined ? null : value);
        this._storeProperty(name, value, options);
      }
    },
    default: null
  },
  backgroundImage: 'image',
  bounds: {
    type: 'bounds',
    access: {
      set() {
        console.warn(this.type + ': Can not set read-only property "bounds".');
      }
    }
  },
  background: {
    type: 'color',
    access: {
      set(name, value, options) {
        this._nativeSet(name, value === undefined ? null : value);
        this._storeProperty(name, value, options);
      }
    }
  },
  textColor: {
    type: 'color',
    access: {
      set(name, value, options) {
        this._nativeSet('foreground', value === undefined ? null : value);
        this._storeProperty(name, value, options);
      },
      get(name) {
        let result = this._getStoredProperty(name);
        if (result === undefined) {
          result = this._nativeGet('foreground');
        }
        return result;
      }
    }
  },
  opacity: {
    type: 'opacity',
    default: 1
  },
  transform: {
    type: 'transform',
    default() {
      return {
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      };
    }
  },
  highlightOnTouch: {
    type: 'boolean',
    default: false
  },
  cornerRadius: {
    type: 'number',
    default: 0
  },
  id: {
    type: 'string',
    access: {
      set(name, value, options) {
        this._storeProperty(name, value, options);
      },
      get(name) {
        return this._getStoredProperty(name);
      }
    }
  },
  class: {
    type: 'string',
    access: {
      set(name, value) {
        this._classList = value.trim().split(/\s+/);
      },
      get() {
        return this.classList.join(' ');
      }
    }
  },
  gestures: {
    access: {
      set(name, gestures) {
        this._gestures = extend({}, defaultGestures, gestures);
      },
      get() {
        if (!this._gestures) {
          this._gestures = extend({}, defaultGestures);
        }
        return this._gestures;
      }
    }
  },
  win_theme: {
    type: ['choice', ['default', 'light', 'dark']],
    default: 'default'
  }
};

let defaultGestures = {
  tap: {type: 'tap'},
  longpress: {type: 'longpress'},
  pan: {type: 'pan'},
  'pan:left': {type: 'pan', direction: 'left'},
  'pan:right': {type: 'pan', direction: 'right'},
  'pan:up': {type: 'pan', direction: 'up'},
  'pan:down': {type: 'pan', direction: 'down'},
  'pan:horizontal': {type: 'pan', direction: 'horizontal'},
  'pan:vertical': {type: 'pan', direction: 'vertical'},
  'swipe:left': {type: 'swipe', direction: 'left'},
  'swipe:right': {type: 'swipe', direction: 'right'},
  'swipe:up': {type: 'swipe', direction: 'up'},
  'swipe:down': {type: 'swipe', direction: 'down'}
};

function renderLayoutData() {
  if (this._layoutData) {
    let checkedData = Layout.checkConsistency(this._layoutData);
    this._nativeSet('layoutData', Layout.resolveReferences(checkedData, this));
  }
}

function getGestureEventConfig(name) {
  return {
    listen(state) {
      let gestures = this.get('gestures');
      if (state) {
        let properties = extend({target: this}, gestures[name]);
        let recognizer = new GestureRecognizer(properties)
          .on('gesture', gestureListener, {target: this, name});
        if (!this._recognizers) {
          this._recognizers = {};
        }
        this._recognizers[name] = recognizer;
        this.on('dispose', recognizer.dispose, recognizer);
      } else if (this._recognizers && name in this._recognizers) {
        this._recognizers[name].dispose();
        delete this._recognizers[name];
      }
    }
  };
}

function gestureListener(event) {
  this.target.trigger(this.name, this.target, event);
}

function triggerWithTarget(event, name) {
  this.trigger(name, this, event || {});
}
