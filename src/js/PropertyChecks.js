/*******************************************************************************
 * Copyright (c) 2014 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

(function() {

  tabris.PropertyChecks = {

    boolean: function(bool) {
      return !!bool;
    },

    string: function(str) {
      return "" + str;
    },

    natural: function(number) {
      if (typeof number !== "number") {
        throw new Error(typeof number + " is not a number: " + number);
      }
      if (number < 0 || isNaN(number) || number === Infinity) {
        throw new Error("Number is not a valid value: " + number);
      }
      return Math.round(number);
    },

    integer: function(number) {
      if (typeof number !== "number") {
        throw new Error(typeof number + " is not a number: " + number);
      }
      if (isNaN(number) || number === Infinity || number === -Infinity) {
        throw new Error("Number is not a valid value: " + number);
      }
      return Math.round(number);
    },

    image: function(image) {
      if (typeof image === "string") {
        image = {src: image};
      }
      if (!image || typeof image !== "object") {
        throw new Error("Not an image: " + image);
      }
      if (typeof image.src !== "string") {
        throw new Error("image.src is not a string");
      }
      if (image.src === "") {
        throw new Error("image.src is an empty string");
      }
      ["scale", "width", "height"].forEach(function(prop) {
        if (prop in image && !isDimension(image[prop])) {
          throw new Error("image." + prop + " is not a dimension: " + image[prop]);
        }
      });
      if ("scale" in image && ("width" in image || "height" in image)) {
        console.warn("Image scale is ignored if width or height are given");
      }
      return image;
    },

    layoutData: function checkLayoutData(layoutData) {
      if ("centerX" in layoutData) {
        if (("left" in layoutData) || ("right" in layoutData)) {
          console.warn("Inconsistent layoutData: centerX overrides left and right");
          return util.omit(layoutData, ["left", "right"]);
        }
      } else if (!("left" in layoutData) && !("right" in layoutData)) {
        console.warn("Incomplete layoutData: either left, right or centerX should be specified");
      }
      if ("baseline" in layoutData) {
        if (("top" in layoutData) || ("bottom" in layoutData) || ("centerY" in layoutData)) {
          console.warn("Inconsistent layoutData: baseline overrides top, bottom, and centerY");
          return util.omit(layoutData, ["top", "bottom", "centerY"]);
        }
      } else if ("centerY" in layoutData) {
        if (("top" in layoutData) || ("bottom" in layoutData)) {
          console.warn("Inconsistent layoutData: centerY overrides top and bottom");
          return util.omit(layoutData, ["top", "bottom"]);
        }
      } else if (!("top" in layoutData) && !("bottom" in layoutData)) {
        console.warn("Incomplete layoutData: either top, bottom, centerY, or baseline should be specified");
      }
      return layoutData;
    }

  };

  function isDimension(value) {
    return typeof value === "number" && !isNaN(value) && value >= 0 && value !== Infinity;
  }

}());
