(function() {

  tabris.ImageData = function() {
    var array, width, height;
    if (arguments.length < 2) {
      throw new TypeError("Not enough arguments to ImageData");
    }
    if (arguments[0] instanceof Uint8ClampedArray) {
      array = checkArray(arguments[0]);
      width = checkSize(arguments[1]);
      height = arguments.length > 2 ? checkSize(arguments[2]) : array.byteLength / 4 / width;
      if (array.byteLength !== width * height * 4) {
        throw new Error("Wrong array size");
      }
    } else {
      width = checkSize(arguments[0]);
      height = checkSize(arguments[1]);
      array = new Uint8ClampedArray(width * height * 4);
    }
    Object.defineProperty(this, "data", {
      value: array,
      writable: false
    });
    Object.defineProperty(this, "width", {
      value: width,
      writable: false
    });
    Object.defineProperty(this, "height", {
      value: height,
      writable: false
    });
  };

  if (!("ImageData" in window)) {
    window.ImageData = tabris.ImageData;
  }

  function checkArray(array) {
    if (array.byteLength % 4 !== 0) {
      throw new Error("Illegal array length");
    }
    return array;
  }

  function checkSize(input) {
    var size = Math.floor(input);
    if (size <= 0 || !isFinite(size)) {
      throw new Error("Illegal size for ImageData");
    }
    return size;
  }

}());
