import {types} from './property-types';
import {warn} from './Console';
import LayoutData from './LayoutData';
import Constraint from './Constraint';
import Percent from './Percent';

const layoutDataProps = ['left', 'right', 'top', 'bottom', 'width', 'height', 'centerX', 'centerY', 'baseline'];

export default {

  checkConsistency(layoutData) {
    let result = layoutData;
    if (result.centerX !== 'auto') {
      if (result.left !== 'auto' || result.right !== 'auto') {
        warn('Inconsistent layoutData: centerX overrides left and right');
        result = makeAuto(result, 'left', 'right');
      }
    }
    if (result.baseline !== 'auto') {
      if (result.top !== 'auto' || result.bottom !== 'auto' || result.centerY !== 'auto') {
        warn('Inconsistent layoutData: baseline overrides top, bottom, and centerY');
        result = makeAuto(result, 'top', 'bottom', 'centerY');
      }
    } else if (result.centerY !== 'auto') {
      if (result.top !== 'auto' || result.bottom !== 'auto') {
        warn('Inconsistent layoutData: centerY overrides top and bottom');
        result = makeAuto(result, 'top', 'bottom');
      }
    }
    if (result.left !== 'auto' && result.right !== 'auto' && result.width !== 'auto') {
      warn('Inconsistent layoutData: left and right are set, ignore width');
      result = makeAuto(result, 'width');
    }
    if (result.top !== 'auto' && result.bottom !== 'auto' && result.height !== 'auto') {
      warn('Inconsistent layoutData: top and bottom are set, ignore height');
      result = makeAuto(result, 'height');
    }
    return result;
  },

  resolveReferences(layoutData, targetWidget) {
    let result = {};
    for (let i = 0; i < layoutDataProps.length; i++) {
      const prop = layoutDataProps[i];
      if (prop in layoutData && layoutData[prop] !== 'auto') {
        result[prop] = resolveAttribute(layoutData[prop], targetWidget);
      }
    }
    return result;
  },

  addToQueue(parent) {
    layoutQueue[parent.cid] = parent;
  },

  flushQueue() {
    for (let cid in layoutQueue) {
      layoutQueue[cid]._flushLayout();
    }
    layoutQueue = {};
  }

};

let layoutQueue = {};

function resolveAttribute(value, widget) {
  if (value instanceof Constraint) {
    return resolveConstraint(value, widget);
  }
  if (isNumber(value)) {
    return value;
  }
  return toProxyId(value, widget);
}

function resolveConstraint(constraint, widget) {
  if (constraint.reference instanceof Percent) {
    if (constraint.reference.percent === 0) {
      return constraint.offset;
    }
    return [constraint.reference.percent, constraint.offset];
  }
  return [toProxyId(constraint.reference, widget), constraint.offset];
}

function toProxyId(ref, widget) {
  if (ref === LayoutData.prev) {
    let children = getParent(widget)._children();
    let index = children.indexOf(widget);
    if (index > 0) {
      return types.proxy.encode(children[index - 1]) || 0;
    }
    return 0;
  }
  if (ref === LayoutData.next) {
    let children = getParent(widget)._children();
    let index = children.indexOf(widget);
    if (index + 1 < children.length) {
      return types.proxy.encode(children[index + 1]) || 0;
    }
    return 0;
  }
  if (typeof ref === 'string') {
    let proxy = widget.siblings(ref)[0];
    return types.proxy.encode(proxy) || 0;
  }
  if (widget.siblings().toArray().includes(ref)) {
    return types.proxy.encode(ref) || 0;
  }
  return 0;
}

function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

function getParent(widget) {
  return widget.parent() || emptyParent;
}

function makeAuto(layoutData, ...props) {
  const override = {};
  for (let i = 0; i < props.length; i++) {
    override[props[i]] = 'auto';
  }
  return LayoutData.from(Object.assign({}, layoutData, override));
}

let emptyParent = {
  children() {
    return [];
  }
};
