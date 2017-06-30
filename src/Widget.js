import Layout from './Layout';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import GestureRecognizer from './GestureRecognizer';
import {animate} from './Animation';
import {types} from './property-types';

const EVENT_TYPES = ['touchStart', 'touchMove', 'touchEnd', 'touchCancel', 'resize'];

export default class Widget extends NativeObject {

  constructor(properties) {
    super();
    if (this.constructor === Widget) {
      throw new Error('Cannot instantiate abstract Widget');
    }
    if (this._nativeType) {
      this._create(this._nativeType, properties);
    }
  }

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
  }

  appendTo(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot append to non-widget');
    }
    this._setParent(widget);
    return this;
  }

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
  }

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
  }

  detach() {
    this._checkDisposed();
    this._setParent(null);
    return this;
  }

  parent() {
    return this._parent || null;
  }

  children(selector) {
    return new WidgetCollection(this._getSelectableChildren(), selector);
  }

  siblings(selector) {
    let siblings = (this._parent ? this._parent._getSelectableChildren() : []);
    let filtered = siblings.filter(widget => widget !== this);
    return new WidgetCollection(filtered, selector);
  }

  find(selector) {
    return new WidgetCollection(this._getSelectableChildren(), selector, true);
  }

  apply(sheet) {
    let scope = new WidgetCollection((this._children || []).concat(this), '*', true);
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
  }

  get data() {
    if (!this.$data) {
      this.$data = {};
    }
    return this.$data;
  }

  _getContainer() {
    return this;
  }

  _getSelectableChildren() {
    return this._children;
  }

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
  }

  _acceptChild() {
    return false;
  }

  _addChild(child, index) {
    if (!this._acceptChild(child)) {
      throw new Error(child + ' could not be appended to ' + this);
    }
    if (!this._children) {
      this._children = [];
    }
    if (typeof index === 'number') {
      this._children.splice(index, 0, child);
    } else {
      index = this._children.push(child) - 1;
    }
    super._trigger('addChild', {child, index});
    this._nativeCall('insertChild', {child: child.cid, index});
  }

  _removeChild(child) {
    if (this._children) {
      let index = this._children.indexOf(child);
      if (index !== -1) {
        this._children.splice(index, 1);
        super._trigger('removeChild', {child, index});
      }
    }
  }

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
  }

  _listen(name, listening) {
    if (this._isDisposed) {
      return;
    }
    if (this.gestures[name]) {
      if (listening) {
        let properties = Object.assign({target: this}, this.gestures[name]);
        let recognizer = new GestureRecognizer(properties).on('gesture', event => {
          if (event.translation) {
            event.translationX = event.translation.x;
            event.translationY = event.translation.y;
          }
          if (event.velocity) {
            event.velocityX = event.velocity.x;
            event.velocityY = event.velocity.y;
          }
          super._trigger(name, event);
        });
        if (!this._recognizers) {
          this._recognizers = {};
        }
        this._recognizers[name] = recognizer;
        this.on('dispose', recognizer.dispose, recognizer);
      } else if (this._recognizers && name in this._recognizers) {
        this._recognizers[name].dispose();
        delete this._recognizers[name];
      }
    } else if (name === 'boundsChanged') {
      this._onoff('resize', listening, this.$triggerChangeBounds);
    } else if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'resize') {
      if (hasAndroidResizeBug()) {
        setTimeout(() => super._trigger(name, types.bounds.decode(event.bounds)), 0);
      } else {
        super._trigger(name, types.bounds.decode(event.bounds));
      }
    } else {
      return super._trigger(name, event);
    }
  }

  $triggerChangeBounds({left, top, width, height}) {
    super._trigger('boundsChanged', {value: {left, top, width, height}});
  }

  _flushLayout() {
    if (this._children) {
      this._children.forEach((child) => {
        renderLayoutData.call(child);
      });
    }
  }

  get classList() {
    if (!this._classList) {
      this._classList = [];
    }
    return this._classList;
  }

}

NativeObject.defineProperties(Widget.prototype, {
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
    set(name, value) {
      this._layoutData = value;
      if (this._parent) {
        Layout.addToQueue(this._parent);
      }
    },
    get() {
      return this._layoutData || null;
    }
  },
  left: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  right: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  top: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  bottom: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  width: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  height: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  centerX: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  centerY: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  baseline: {type: 'sibling', get: getLayoutProperty, set: setLayoutProperty},
  elevation: {
    type: 'number',
    default: 0
  },
  font: {
    type: 'font',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    },
    default: null
  },
  backgroundImage: {
    type: 'image'
  },
  bounds: {
    type: 'bounds',
    readonly: true
  },
  background: {
    type: 'color',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
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
    set(name, value) {
      this._storeProperty(name, value);
    },
    get(name) {
      return this._getStoredProperty(name);
    }
  },
  class: {
    type: 'string',
    set(name, value) {
      this._classList = value.trim().split(/\s+/);
    },
    get() {
      return this.classList.join(' ');
    }
  },
  gestures: {
    set(name, gestures) {
      this._gestures = Object.assign({}, defaultGestures, gestures);
    },
    get() {
      if (!this._gestures) {
        this._gestures = Object.assign({}, defaultGestures);
      }
      return this._gestures;
    }
  },
  win_theme: {
    type: ['choice', ['default', 'light', 'dark']],
    default: 'default'
  }
});

Widget.prototype.animate = animate;

function hasAndroidResizeBug() {
  if (!('cache' in hasAndroidResizeBug)) {
    hasAndroidResizeBug.cache = tabris.device.platform === 'Android' && tabris.device.version <= 17;
  }
  return hasAndroidResizeBug.cache;
}

let defaultGestures = {
  tap: {type: 'tap'},
  longpress: {type: 'longpress'},
  pan: {type: 'pan'},
  panLeft: {type: 'pan', direction: 'left'},
  panRight: {type: 'pan', direction: 'right'},
  panUp: {type: 'pan', direction: 'up'},
  panDown: {type: 'pan', direction: 'down'},
  panHorizontal: {type: 'pan', direction: 'horizontal'},
  panVertical: {type: 'pan', direction: 'vertical'},
  swipeLeft: {type: 'swipe', direction: 'left'},
  swipeRight: {type: 'swipe', direction: 'right'},
  swipeUp: {type: 'swipe', direction: 'up'},
  swipeDown: {type: 'swipe', direction: 'down'}
};

function renderLayoutData() {
  if (this._layoutData) {
    let checkedData = Layout.checkConsistency(this._layoutData);
    this._nativeSet('layoutData', Layout.resolveReferences(checkedData, this));
  }
}

function setLayoutProperty(name, value) {
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
}

function getLayoutProperty(name) {
  return this._layoutData && this._layoutData[name] != null ? this._layoutData[name] : null;
}