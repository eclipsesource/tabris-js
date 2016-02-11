(function() {

  _.fontStringToObject = function(str) {
    var result = {family: [], size: 0, style: "normal", weight: "normal"};
    var parts = str.split(/(?:\s|^)\d+px(?:\s|$)/);
    checkTruthy(parts.length === 2 || parts.length === 1, "Invalid font syntax");
    result.size = parseInt(/(?:\s|^)(\d+)px(?:\s|$)/.exec(str)[1], 10);
    parseStyles(result, parts[0]);
    parseFamily(result, parts[1]);
    return result;
  };

  _.fontObjectToString = function(font) {
    return [font.style, font.weight, font.size + "px", font.family.join(", ")].join(" ").trim();
  };

  function parseStyles(fontArr, styles) {
    var styleArr = styles.trim().split(/\s+/);
    checkTruthy(styleArr.length <= 2, "Too many font styles");
    styleArr.forEach(function(property) {
      switch (property.trim()) {
        case "italic":
          checkTruthy(fontArr.style === "normal", "Invalid font variant");
          fontArr.style = "italic";
          break;
        case "black":
        case "bold":
        case "medium":
        case "thin":
        case "light":
          checkTruthy(fontArr.weight === "normal", "Invalid font weight");
          fontArr.weight = property.trim();
          break;
        case "normal":
        case "":
          break;
        default:
          throw new Error("Unknown font property: " + property.trim());
      }
    });
  }

  function parseFamily(fontArr, family) {
    // NOTE: Currently family is optional to allow for default fonts, but this is
    //       not CSS font syntax. See https://github.com/eclipsesource/tabris-js/issues/24
    (family ? family.split(",") : []).forEach(function(name) {
      var valid = /(?:^\s*[^\"\']+\s*$)|(?:^\s*\"[^\"\']+\"\s*$)|(?:^\s*\'[^\"\']+\'\s*$)/.exec(name);
      checkTruthy(valid, "Invalid font family: " + name);
      fontArr.family.push(/^\s*[\"\']?([^\"\']*)/.exec(name)[1].trim());
    });
  }

  function checkTruthy(value, message) {
    if (!value) {
      throw new Error(message);
    }
  }

}());
