(function() {

  tabris.PropertyDecoding = {

    color: function(value) {
      if (!value) {
        // NOTE: null is only returned for "background" where it means "no background"
        return "rgba(0, 0, 0, 0)";
      }
      return util.colorArrayToString(value);
    },

    font: function(value) {
      if (!value) {
        // NOTE: workaround to allow triggering a change event when setting font to "initial"
        return "initial";
      }
      return util.fontArrayToString(value);
    },

    image: function(value) {
      if (!value) {
        return null;
      }
      return util.imageFromArray(value);
    },

    bounds: function(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    },

    layoutData: function(value) {
      return tabris.Layout.decodeLayoutData(value);
    }

  };

}());
