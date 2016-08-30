import {omit} from "./util";
import {types} from "./property-types";

export default {

  checkConsistency: function(layoutData) {
    var result = layoutData;
    if ("centerX" in result) {
      if (("left" in result) || ("right" in result)) {
        console.warn("Inconsistent layoutData: centerX overrides left and right");
        result = omit(result, ["left", "right"]);
      }
    }
    if ("baseline" in result) {
      if (("top" in result) || ("bottom" in result) || ("centerY" in result)) {
        console.warn("Inconsistent layoutData: baseline overrides top, bottom, and centerY");
        result = omit(result, ["top", "bottom", "centerY"]);
      }
    } else if ("centerY" in result) {
      if (("top" in result) || ("bottom" in result)) {
        console.warn("Inconsistent layoutData: centerY overrides top and bottom");
        result = omit(result, ["top", "bottom"]);
      }
    }
    if ("left" in result && "right" in result && "width" in result) {
      console.warn("Inconsistent layoutData: left and right are set, ignore width");
      result = omit(result, ["width"]);
    }
    if ("top" in result && "bottom" in result && "height" in result) {
      console.warn("Inconsistent layoutData: top and bottom are set, ignore height");
      result = omit(result, ["height"]);
    }
    return result;
  },

  resolveReferences: function(layoutData, targetWidget) {
    if (!targetWidget) {
      return layoutData;
    }
    var result = {};
    for (var key in layoutData) {
      result[key] = resolveAttribute(layoutData[key], targetWidget);
    }
    return result;
  },

  addToQueue: function(parent) {
    layoutQueue[parent.cid] = parent;
  },

  flushQueue: function() {
    for (var cid in layoutQueue) {
      layoutQueue[cid]._flushLayout();
    }
    layoutQueue = {};
  }

};

var layoutQueue = {};

function resolveAttribute(value, widget) {
  if (Array.isArray(value)) {
    return resolveArray(value, widget);
  }
  if (isNumber(value)) {
    return value;
  }
  return toProxyId(value, widget);
}

function resolveArray(array, widget) {
  if (isNumber(array[0])) {
    return array;
  }
  return [toProxyId(array[0], widget), array[1]];
}

function toProxyId(ref, widget) {
  if (ref === "prev()") {
    var children = getParent(widget).children();
    var index = children.indexOf(widget);
    if (index > 0) {
      return types.proxy.encode(children[index - 1]) || 0;
    }
    return 0;
  }
  if (typeof ref === "string") {
    var proxy = getParent(widget).children(ref)[0];
    return types.proxy.encode(proxy) || 0;
  }
  return types.proxy.encode(ref) || 0;
}

function isNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function getParent(widget) {
  return widget.parent() || emptyParent;
}

var emptyParent = {
  children: function() {
    return [];
  }
};
