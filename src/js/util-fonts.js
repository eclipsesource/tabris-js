/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  util.fontStringToArray = function(str) {
    var result = [[], 0, false, false];
    var parts = str.split(/(?:\s|^)\d+px(?:\s|$)/);
    checkTruthy(parts.length === 2 || parts.length === 1, "Invalid font syntax");
    result[1] = parseInt(/(?:\s|^)(\d+)px(?:\s|$)/.exec(str)[1], 10);
    parseStyles(result, parts[0]);
    parseFamily(result, parts[1]);
    return result;
  };

  util.fontArrayToString = function(fontArr) {
    return (fontArr[3] ? "italic " : "") + (fontArr[2] ? "bold " : "") +
        (fontArr[1] + "px") + (fontArr[0][0] ? " " : "") + (fontArr[0].join(", "));
  };

  var parseStyles = function(fontArr, styles) {
    var styleArr = styles.trim().split(/\s+/);
    checkTruthy(styleArr.length <= 2, "Too many font styles");
    styleArr.forEach(function(property) {
      switch (property.trim()) {
        case "italic":
          checkTruthy(fontArr[3] === false, "Invalid font variant");
          fontArr[3] = true;
          break;
        case "bold":
          checkTruthy(fontArr[2] === false, "Invalid font weight");
          fontArr[2] = true;
          break;
        case "normal":
        case "":
          break;
        default:
          throw new Error("Unknown font property: " + property.trim());
      }
    });
  };

  var parseFamily = function(fontArr, family) {
    // NOTE: Currently family is optional to allow for default fonts, but this is
    //       not CSS font syntax. See https://github.com/eclipsesource/tabris-js/issues/24
    (family ? family.split(",") : []).forEach(function(name) {
      var valid = /(?:^\s*[^\"\']+\s*$)|(?:^\s*\"[^\"\']+\"\s*$)|(?:^\s*\'[^\"\']+\'\s*$)/.exec(name);
      checkTruthy(valid, "Invalid font family: " + name);
      fontArr[0].push(/^\s*[\"\']?([^\"\']*)/.exec(name)[1].trim());
    });
  };

  var checkTruthy = function(value, message) {
    if (!value) {
      throw new Error(message);
    }
  };

}());
