
export function colorArrayToString(array) {
  var r = array[0];
  var g = array[1];
  var b = array[2];
  var a = array.length === 3 ? 1 : Math.round(array[3] * 100 / 255) / 100;
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

export function colorStringToArray(str) {
  if (str === "transparent") {
    return [0, 0, 0, 0];
  }
  // #xxxxxx
  if (/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.test(str)) {
    return [
      parseInt(RegExp.$1, 16),
      parseInt(RegExp.$2, 16),
      parseInt(RegExp.$3, 16),
      255
    ];
  }
  // #xxx
  if (/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.test(str)) {
    return [
      parseInt(RegExp.$1, 16) * 17,
      parseInt(RegExp.$2, 16) * 17,
      parseInt(RegExp.$3, 16) * 17,
      255
    ];
  }
  // #rgb(r, g, b)
  if (/^rgb\s*\(\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*\)$/.test(str)) {
    return [
      Math.max(0, Math.min(255, parseInt(RegExp.$1))),
      Math.max(0, Math.min(255, parseInt(RegExp.$2))),
      Math.max(0, Math.min(255, parseInt(RegExp.$3))),
      255
    ];
  }
  // rgba(r, g, b, a)
  if (/^rgba\s*\(\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*,\s*([+\-]?([0-9]*\.)?[0-9]+)\s*\)$/.test(str)) {
    return [
      Math.max(0, Math.min(255, parseInt(RegExp.$1))),
      Math.max(0, Math.min(255, parseInt(RegExp.$2))),
      Math.max(0, Math.min(255, parseInt(RegExp.$3))),
      Math.round(Math.max(0, Math.min(1, parseFloat(RegExp.$4))) * 255)
    ];
  }
  // named colors
  if (str in NAMES) {
    var rgb = NAMES[str];
    return [rgb[0], rgb[1], rgb[2], 255];
  }
  throw new Error("invalid color: " + str);
}

/*
 * Basic color keywords as defined in CSS 3
 * See http://www.w3.org/TR/css3-color/#html4
 */
var NAMES = {
  black: [0, 0, 0],
  silver: [192, 192, 192],
  gray: [128, 128, 128],
  white: [255, 255, 255],
  maroon: [128, 0, 0],
  red: [255, 0, 0],
  purple: [128, 0, 128],
  fuchsia: [255, 0, 255],
  green: [0, 128, 0],
  lime: [0, 255, 0],
  olive: [128, 128, 0],
  yellow: [255, 255, 0],
  navy: [0, 0, 128],
  blue: [0, 0, 255],
  teal: [0, 128, 128],
  aqua: [0, 255, 255]
};
