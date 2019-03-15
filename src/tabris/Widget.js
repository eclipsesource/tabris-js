import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import GestureRecognizer from './GestureRecognizer';
import {animate} from './Animation';
import {jsxFactory} from './JsxProcessor';
import {types} from './property-types';
import LayoutData from './LayoutData';
import {getFilter} from './util-widget-select';

/**
 * @abstract
 */
export default class Widget extends NativeObject {

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
    const parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert before orphan');
    }
    const index = parent.$children.indexOf(widget);
    this._setParent(parent, index);
    return this;
  }

  insertAfter(widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error('Cannot insert after non-widget');
    }
    const parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert after orphan');
    }
    this.detach();
    const index = parent.$children.indexOf(widget);
    this._setParent(parent, index + 1);
    return this;
  }

  detach() {
    this._checkDisposed();
    this._setParent(null);
    return this;
  }

  parent(selector) {
    if (!selector || !this._parent) {
      return this._parent || null;
    }
    let candidate = this._parent;
    const filter = getFilter(selector);
    while (candidate && !filter(candidate)) {
      candidate = candidate.parent();
    }
    return candidate;
  }

  siblings(selector) {
    if (!this._parent) {
      return new WidgetCollection([]);
    }
    return this._parent._children(widget => widget !== this).filter(selector);
  }

  get classList() {
    if (!this._classList) {
      this._classList = [];
    }
    return this._classList;
  }

  get data() {
    if (!this.$data) {
      this.$data = {};
    }
    return this.$data;
  }

  toString() {
    const type = this.constructor.name;
    const cidAttr = `[cid="${this.cid}"]`;
    const id = this.id ? '#' + this.id : '';
    const classes = this.classList.length ? '.' + this.classList.join('.') : '';
    return type + cidAttr + id + classes;
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    if (this.id) {
      result.push(['id', this.id]);
    }
    if (this.class) {
      result.push(['class', this.class]);
    }
    const bounds = this.bounds;
    result.push([
      'bounds',
      `{left: ${Math.round(bounds.left)}, top: ${Math.round(bounds.top)}, ` +
      `width: ${Math.round(bounds.width)}, height: ${Math.round(bounds.height)}}`
    ]);
    if (!this.enabled) {
      result.push(['enabled', 'false']);
    }
    if (!this.visible) {
      result.push(['visible', 'false']);
    }
    return result;
  }

  _setParent(parent, index) {
    if (this._parent) {
      this._parent._removeChild(this);
    }
    this._parent = parent;
    if (this._parent) {
      this._parent._addChild(this, index);
    }
  }

  _listen(name, listening) {
    if (this._isDisposed) {
      return;
    }
    if (this.gestures[name]) {
      if (listening) {
        const properties = Object.assign({target: this}, this.gestures[name]);
        const recognizer = new GestureRecognizer(properties).on('gesture', event => {
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

  _release() {
    if (this._parent) {
      this._parent._removeChild(this);
      delete this._parent;
    }
  }

  $triggerChangeBounds({left, top, width, height}) {
    super._trigger('boundsChanged', {value: {left, top, width, height}});
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, attributes) {
    return this.createNativeObject(Type, attributes);
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
  elevation: {
    type: 'number',
    default: 0
  },
  bounds: {
    type: 'bounds',
    readonly: true
  },
  background: {
    type: 'shader',
    set(name, value) {
      this._nativeSet(name, value);
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
  }
});

const layoutDataProps = ['left', 'right', 'top', 'bottom', 'width', 'height', 'centerX', 'centerY', 'baseline'];

NativeObject.defineProperties(Widget.prototype, {
  layoutData: {
    set(name, value) {
      const oldLayoutData = this._layoutData;
      this._layoutData = value ? LayoutData.from(value) : new LayoutData({});
      this._triggerChangeEvent(name, this._layoutData);
      layoutDataProps.forEach(prop => {
        const oldValue = oldLayoutData ? oldLayoutData[prop] : 'auto';
        if (oldValue !== this._layoutData[prop]) {
          this._triggerChangeEvent(prop, this._layoutData[prop]);
        }
      });
    },
    get() {
      if (!this._layoutData) {
        this._layoutData = new LayoutData({});
      }
      return this._layoutData;
    }
  },
  padding: {
    type: 'boxDimensions',
    default: {left: 0, right: 0, top: 0, bottom: 0}
  },
  excludeFromLayout: {
    type: 'boolean',
    default: false,
    set(name, value) {
      if (this._excludeFromLayout !== !!value) {
        this._excludeFromLayout = !!value;
        if (this._parent) {
          this._parent._scheduleRenderChildren();
        }
        this._triggerChangeEvent(name, this._excludeFromLayout);
      }
    },
    get() {
      return !!this._excludeFromLayout;
    }
  }
});

layoutDataProps.forEach(prop => {
  NativeObject.defineProperty(Widget.prototype, prop, {
    set(name, value) {
      this.layoutData = LayoutData.from(Object.assign({}, this.layoutData, {[name]: value}));
    },
    get(name) {
      return this.layoutData[name];
    }
  });
});

NativeObject.defineEvents(Widget.prototype, {
  tap: true,
  longPress: true,
  pan: true,
  panLeft: true,
  panRight: true,
  panUp: true,
  panDown: true,
  panHorizontal: true,
  panVertical: true,
  swipeLeft: true,
  swipeRight: true,
  swipeUp: true,
  swipeDown: true,
  touchStart: {native: true},
  touchMove: {native: true},
  touchEnd: {native: true},
  touchCancel: {native: true},
  resize: {native: true},
  addChild: true,
  removeChild: true
});

Widget.prototype.animate = animate;

function hasAndroidResizeBug() {
  if (!('cache' in hasAndroidResizeBug)) {
    hasAndroidResizeBug.cache = tabris.device.platform === 'Android' && tabris.device.version <= 17;
  }
  return hasAndroidResizeBug.cache;
}

const defaultGestures = {
  tap: {type: 'tap'},
  longPress: {type: 'longPress'},
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
