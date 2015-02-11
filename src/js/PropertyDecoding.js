(function() {

  tabris.PropertyDecoding = {

    color: function(value) {
      return util.colorArrayToString(value);
    },

    font: function(value) {
      return util.fontArrayToString(value);
    },

    image: function(value) {
      return util.imageFromArray(value);
    },

    bounds: function(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    },

    layoutData: function(value) {
      if (!value) {
        return null;
      }
      var result = {};
      for (var key in value) {
        if (Array.isArray(value[key])) {
          result[key] = value[key].map(proxyOrNumber);
        } else {
          result[key] = proxyOrNumber(value[key]);
        }
      }
      return result;
    }

  };

  function proxyOrNumber(value) {
    if (typeof value === "string") {
      return tabris._proxies[value] || 0;
    }
    return value;
  }

}());
