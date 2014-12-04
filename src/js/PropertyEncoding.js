/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.PropertyEncoding = {

    encodeColor: function(value) {
      return util.colorStringToArray(value);
    },

    encodeFont: function(value) {
      return util.fontStringToArray(value);
    },

    decodeFont: function(value) {
      return util.fontArrayToString(value);
    },

    encodeImage: function(value) {
      return util.imageToArray(value);
    },

    decodeImage: function(value) {
      return util.imageFromArray(value);
    },

    decodeBounds: function(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    },

    encodeLayoutData: function(value) {
      var result = {};
      for (var key in value) {
        if (Array.isArray(value[key])) {
          result[key] = value[key].map(tabris.PropertyEncoding.encodeProxyToId);
        } else {
          result[key] = tabris.PropertyEncoding.encodeProxyToId(value[key]);
        }
      }
      return result;
    },

    encodeBounds: function(value) {
      return [value.left, value.top, value.width, value.height];
    },

    encodeProxyToId: function(value) {
      if (value instanceof tabris.Proxy) {
        return value.id;
      }
      if (value instanceof tabris.ProxyCollection && value[0]) {
        return value[0].id;
      }
      return value;
    },

    decodeColor: function(value) {
      return util.colorArrayToString(value);
    }

  };

}());
