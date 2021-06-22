import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import GestureRecognizer from './GestureRecognizer';
import {animate} from './Animation';
import JsxProcessor from './JsxProcessor';
import {types} from './property-types';
import LayoutData, {mergeLayoutData} from './LayoutData';
import {getFilter} from './util-widget-select';
import {toValueString, hint} from './Console';
import checkType from './checkType';
import {jsxFactory} from './symbols';
import Composite from './widgets/Composite';

const layoutDataProps: Array<keyof LayoutDataLikeObject>
  = ['left', 'right', 'top', 'bottom', 'width', 'height', 'centerX', 'centerY', 'baseline'];

const jsxShorthands = {
  center: 'layoutData',
  stretch: 'layoutData',
  stretchX: 'layoutData',
  stretchY: 'layoutData'
};

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

type Gesture = keyof typeof defaultGestures;

/**
 * @abstract
 */
class Widget extends NativeObject {

  enabled!: boolean;
  visible!: boolean;
  elevation!: number;
  bounds!: Bounds;
  background: unknown;
  opacity!: number;
  transform!: Transformation;
  highlightOnTouch!: boolean;
  cornerRadius!: number;
  padding!: BoxDimensionsObject;

  animate!: typeof animate;

  _parent?: Composite | null;
  _layoutData?: LayoutDataLikeObject & LayoutData;
  _classList?: string[];
  _id?: string;
  _gestures?: typeof defaultGestures;
  _excludeFromLayout?: boolean;
  _recognizers?: Record<Gesture, GestureRecognizer>;
  [jsxFactory]!: (type: Constructor<Widget>, attributes: object) => Widget;

  private $data?: Record<string, unknown>;

  appendTo(widget: Composite) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error(`Cannot append to non-widget ${toValueString(widget)}`);
    }
    this._setParent(widget);
    return this;
  }

  insertBefore(widget: Composite) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error(`Cannot insert before non-widget ${toValueString(widget)}`);
    }
    const parent = widget.parent();
    if (!parent) {
      throw new Error(`Cannot insert before orphan ${toValueString(widget)}`);
    }
    const index = parent.$children.indexOf(widget);
    this._setParent(parent, index);
    return this;
  }

  insertAfter(widget: Composite) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject)) {
      throw new Error(`Cannot insert after non-widget ${toValueString(widget)}`);
    }
    const parent = widget.parent();
    if (!parent) {
      throw new Error(`Cannot insert after orphan ${toValueString(widget)}`);
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

  parent(selector?: Selector): Composite | null {
    if (!selector || !this._parent) {
      return this._parent || null;
    }
    let candidate: Composite | null = this._parent;
    const filter = getFilter(selector);
    while (candidate && !filter(candidate)) {
      candidate = candidate.parent();
    }
    return candidate;
  }

  siblings(selector: Selector): WidgetCollection {
    if (!this._parent) {
      return new WidgetCollection([]);
    }
    return this._parent._children((widget: Widget) => widget !== this).filter(selector);
  }

  set class(value: string | undefined) {
    if (this._isDisposed) {
      hint(this, 'Cannot set property "class" on disposed object');
      return;
    }
    Object.defineProperty(this, '_classList', {
      enumerable: true,
      writable: true,
      value: types.string.convert!(value).trim().split(/\s+/)
    });
    this._triggerChangeEvent('class', this.class);
  }

  get class(): string | undefined {
    if (this._isDisposed) {
      return undefined;
    }
    return this.classList!.join(' ');
  }

  set layoutData(value) {
    if (this._isDisposed) {
      hint(this, 'Cannot set property "layoutData" on disposed object');
      return;
    }
    const oldLayoutData = this._layoutData;
    if (oldLayoutData && oldLayoutData.equals(value)) {
      return;
    }
    Object.defineProperty(this, '_layoutData', {
      enumerable: false,
      writable: true,
      value: (/** @type {LayoutData} */(value ? LayoutData.from(value) : new LayoutData({})))
    });
    this._triggerChangeEvent('layoutData', this._layoutData);
    layoutDataProps.forEach(prop => {
      const oldValue = oldLayoutData ? oldLayoutData[prop] : 'auto';
      if (oldValue !== this._layoutData![prop]) {
        this._triggerChangeEvent(prop, this._layoutData![prop]);
      }
    });
  }

  get layoutData() {
    if (this._isDisposed) {
      return undefined;
    }
    if (!this._layoutData) {
      Object.defineProperty(this, '_layoutData', {
        enumerable: false,
        writable: true,
        value: (/** @type {LayoutData} */(new LayoutData({})))
      });
    }
    return this._layoutData;
  }

  get classList() {
    if (this._isDisposed) {
      return undefined;
    }
    if (!this._classList) {
      Object.defineProperty(this, '_classList', {
        enumerable: true,
        writable: true,
        value: []
      });
    }
    return this._classList;
  }

  set data(value) {
    if (this._isDisposed || this.$data === value) {
      return;
    }
    checkType(value, Object, {name: 'data', nullable: true});
    Object.defineProperty(this, '$data', {
      enumerable: false, writable: true, value
    });
    this._triggerChangeEvent('data', this.$data);
  }

  get data() {
    if (this._isDisposed) {
      return undefined;
    }
    if (!('$data' in this)) {
      Object.defineProperty(this, '$data', {enumerable: false, writable: true, value: {}});
    }
    return this.$data;
  }

  get absoluteBounds() {
    if (this._isDisposed) {
      return undefined;
    }
    return types.Bounds.decode!(this._nativeGet('absoluteBounds'));
  }

  set id(value) {
    /** @type {string} */
    const id = types.string.convert!(value);
    if (id === this._id) {
      return;
    }
    Object.defineProperty(this, '_id', {enumerable: false, writable: true, value: id});
  }

  get id() {
    if (this._isDisposed) {
      return undefined;
    }
    return this._id || '';
  }

  set gestures(gestures: typeof defaultGestures) {
    const value = Object.assign({}, defaultGestures, gestures);
    Object.defineProperty(this, '_gestures', {enumerable: false, writable: true, value});
  }

  get gestures(): typeof defaultGestures {
    if (!this._gestures) {
      const value = Object.assign({}, defaultGestures);
      Object.defineProperty(this, '_gestures', {enumerable: false, writable: true, value});
    }
    return this._gestures!;
  }

  set excludeFromLayout(value) {
    if (this._excludeFromLayout !== !!value) {
      Object.defineProperty(
        this,
        '_excludeFromLayout',
        {enumerable: false, writable: true, value: !!value}
      );
    }
    if (this._parent) {
      this._parent._scheduleRenderChildren();
    }
    this._triggerChangeEvent('excludeFromLayout', this._excludeFromLayout);
  }

  get excludeFromLayout() {
    return !!this._excludeFromLayout;
  }

  toString() {
    const type = this.constructor.name;
    const cidAttr = `[cid="${this.cid}"]`;
    const id = this.id ? '#' + this.id : '';
    const classes = this.classList!.length ? '.' + this.classList!.join('.') : '';
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

  _setParent(parent: Composite | null, index?: number) {
    if (this._parent) {
      this._parent._removeChild(this);
    }
    Object.defineProperty(this, '_parent', {enumerable: false, writable: true, value: parent});
    if (this._parent) {
      this._parent._addChild(this, index);
    }
  }

  _listen(name: string, listening: boolean) {
    if (this._isDisposed) {
      return;
    }
    if (this.gestures[name as Gesture]) {
      const gesture = name as Gesture;
      if (listening) {
        const properties = Object.assign({target: this}, this.gestures[gesture]);
        const recognizer = new GestureRecognizer(properties).on('gesture', (event: any) => {
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
          Object.defineProperty(
            this,
            '_recognizers',
            {enumerable: false, writable: false, value: {}}
          );
        }
        this._recognizers![gesture] = recognizer;
        this.on('dispose', recognizer.dispose, recognizer);
      } else if (this._recognizers && name in this._recognizers) {
        this._recognizers![gesture].dispose();
        delete this._recognizers![gesture];
      }
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name: string, event: {bounds?: any}) {
    if (name === 'resize') {
      return super._trigger(name, types.Bounds.decode!(event.bounds));
    }
    return super._trigger(name, event);
  }

  _release() {
    if (this._parent) {
      this._parent._removeChild(this);
      this._parent = null;
    }
  }

  _reorderProperties(properties: string[]): string[] {
    const layoutDataIndex = properties.indexOf('layoutData');
    if (layoutDataIndex !== -1) {
      const removed = properties.splice(layoutDataIndex, 1);
      return removed.concat(properties);
    }
    return properties;
  }

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface, no-redeclare
interface Widget extends LayoutDataLikeObject {}

export default Widget;

NativeObject.defineProperties(Widget.prototype, {
  enabled: {
    type: types.boolean,
    default: true
  },
  visible: {
    type: types.boolean,
    default: true
  },
  elevation: {
    type: types.natural,
    default: 0
  },
  bounds: {
    type: types.Bounds,
    readonly: true,
    nocache: true
  },
  background: {
    type: types.Shader,
    default: 'initial'
  },
  opacity: {
    type: types.fraction,
    default: 1
  },
  transform: {
    type: types.Transformation,
    default: Object.freeze({
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      translationZ: 0
    })
  },
  highlightOnTouch: {
    type: types.boolean,
    default: false
  },
  cornerRadius: {
    type: types.number,
    default: 0
  },
  padding: {
    type: types.BoxDimensions,
    default: Object.freeze({left: 0, right: 0, top: 0, bottom: 0})
  }
});

layoutDataProps.forEach(prop => {
  Object.defineProperty(Widget.prototype, prop, {
    set(value) {
      this.layoutData = LayoutData.from(Object.assign({}, this.layoutData, {[prop]: value}));
    },
    get() {
      return this.layoutData[prop];
    }
  });
  NativeObject.defineEvent(Widget.prototype, prop + 'Changed', true);
});

NativeObject.defineChangeEvents(Widget.prototype, [
  'layoutData',
  'class',
  'data'
]);

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
  resize: {
    native: true,
    nativeObservable: false,
    changes: 'bounds',
    changeValue: ({left, top, width, height, bounds}: any) => bounds || ({left, top, width, height})
  },
  addChild: true,
  removeChild: true
});

Widget.prototype.animate = animate;

Widget.prototype[jsxFactory] = createElement;

function createElement(this: JsxProcessor, Type: Constructor<Widget>, attributes: object) {
  const finalAttributes = this.withShorthands(
    attributes,
    jsxShorthands,
    mergeLayoutData
  );
  return this.createNativeObject(Type, finalAttributes);
}
