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
    }

  };

}());
