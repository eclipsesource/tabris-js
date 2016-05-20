/*jshint -W097 */
"use strict";

let header = `
// Type definitions for Tabris.js v1.8

interface TextMetrics {

  /**
   * The calculated width of a segment of text.
   * It takes into account the current font of the context.
   */
  width: number;
}

export class CanvasContext {

  /**
   * The thickness of lines in space units.
   */
  lineWidth: number;

  /**
   * Determines how the end points of every line are drawn.
   */
  lineCap: "butt" | "round" | "square";

  /**
   * Determines how two connecting segments in a shape are joined together.
   */
  lineJoin: "bevel" | "round" | "miter";

  /**
   * Specifies the color to use inside shapes.
   */
  fillStyle: string;

  /**
   * Specifies the current text style being used when drawing text.
   */
  font: string;

  /**
   * Specifies the color to use for the lines around shapes.
   */
  strokeStyle: string;

  /**
   * Specifies the current text alignment being used when drawing text.
   */
  textAlign: "left" | "right" | "center" | "start" | "end";

  /**
   * Specifies the current text baseline being used when drawing text.
   */
  textBaseline: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";

  /**
   * Saves the entire state of the canvas by pushing the current state onto a stack.
   */
  save(): void;

  /**
   * Restores the most recently saved canvas state by popping the top entry in the drawing state stack.
   */
  restore(): void;

  /**
   * Starts a new path by emptying the list of sub-paths.
   */
  beginPath(): void;

  /**
   * Adds a straight line from the current point to the start of the current sub-path.
   */
  closePath(): void;

  /**
   * Connects the last point in the sub-path to the *(x, y)* coordinates with a straight line.
   * @param x The x axis of the coordinate for the end of the line.
   * @param y The y axis of the coordinate for the end of the line.
   */
  lineTo(x: number, y: number): void;

  /**
   * Moves the starting point of a new sub-path to the *(x, y)* coordinates.
   * @param x The x axis of the point.
   * @param y The y axis of the point.
   */
  moveTo(x: number, y: number): void;

  /**
   * Adds a cubic Bézier curve to the path. The starting point is the last point in the current path.
   * @param cp1x The x axis of the coordinate for the first control point.
   * @param cp1y The y axis of the coordinate for the first control point.
   * @param cp2x The x axis of the coordinate for the second control point.
   * @param cp2y The y axis of the coordinate for the second control point.
   * @param x The x axis of the coordinate for the end point.
   * @param y The y axis of the coordinate for the end point.
   */
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

  /**
   * Adds a quadratic Bézier curve to the path. The starting point is the last point in the current path.
   * @param cpx The x axis of the coordinate for the control point.
   * @param cpy The y axis of the coordinate for the control point.
   * @param x The x axis of the coordinate for the end point.
   * @param y The y axis of the coordinate for the end point.
   */
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;

  /**
   * Creates a path for a rectangle with the top-left corner at *(x, y)*.
   * @param x The x axis of the rectangle starting point.
   * @param y The y axis of the rectangle starting point.
   * @param width The rectangle's width.
   * @param height The rectangles height.
   */
  rect(x: number, y: number, width: number, height: number): void;

  /**
   * Adds an arc to the path which is centered at *(x, y)* position with radius *r* starting at *startAngle*
   * and ending at *endAngle* going in the given direction by *anticlockwise* (defaulting to clockwise).
   * @param x The x coordinate of the arc's center.
   * @param y The y coordinate of the arc's center.
   * @param radius The arc's radius.
   * @param startAngle The angle in radians at which the arc starts, measured clockwise from the positive x axis.
   * @param startAngle The angle in radians at which the arc ends, measured clockwise from the positive x axis.
   * @param anticlockwise? if true, causes the arc to be drawn counter-clockwise between the two angles.
   */
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;

  /**
   * Adds a scaling transformation to the canvas units by x horizontally and by y vertically.
   * @param x Scaling factor in the horizontal direction.
   * @param y Scaling factor in the vertical direction.
   */
  scale(x: number, y: number): void;

  /**
   * Adds a rotation to the transformation matrix.
   * @param angle The angle to rotate clockwise in radians.
   */
  rotate(angle: number): void;

  /**
   * Adds a translation transformation by moving the canvas and its origin
   * *x* horizontally and *y* vertically on the grid.
   * @param x The distance to move in the horizontal direction.
   * @param y The distance to move in the vertical direction.
   */
  translate(x: number, y: number): void;

  /**
   * Multiplies the current transformation with the matrix described by the arguments of this method.
   * The matrix has the following format:
   * [[a, c, e],
   *  [b, d, f],
   *  [0, 0, 1]]
   * @param a Horizontal scaling.
   * @param b Horizontal skewing.
   * @param c Vertical skewing.
   * @param d Vertical scaling.
   * @param e Horizontal moving.
   * @param f Vertical moving.
   */
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void;

  /**
   * resets (overrides) the current transformation to the identity matrix and then
   * invokes a transformation described by the arguments of this method.
   * The matrix has the following format:
   * [[a, c, e],
   *  [b, d, f],
   *  [0, 0, 1]]
   * @param a Horizontal scaling.
   * @param b Horizontal skewing.
   * @param c Vertical skewing.
   * @param d Vertical scaling.
   * @param e Horizontal moving.
   * @param f Vertical moving.
   */
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;

  /**
   * Sets all pixels in the rectangle defined by starting point *(x, y)*.
   * and size *(width, height)* to transparent black, erasing any previously drawn content.
   * @param x The x axis of the rectangle starting point.
   * @param y The y axis of the rectangle starting point.
   * @param width The rectangle's width.
   * @param height The rectangles height.
   */
  clearRect(x: number, y: number, width: number, height: number): void;

  /**
   * draws a filled rectangle at *(x, y)* position whose size is determined by *width* and *height*.
   * and whose color is determined by the fillStyle attribute.
   * @param x The x axis of the rectangle starting point.
   * @param y The y axis of the rectangle starting point.
   * @param width The rectangle's width.
   * @param height The rectangles height.
   */
  fillRect(x: number, y: number, width: number, height: number): void;

  /**
   * draws the outline of a rectangle at *(x, y)* position whose size is determined by *width* and *height*
   * using the current stroke style.
   * @param x The x axis of the rectangle starting point.
   * @param y The y axis of the rectangle starting point.
   * @param width The rectangle's width.
   * @param height The rectangles height.
   */
  strokeRect(x: number, y: number, width: number, height: number): void;

  /**
   * Fills a given text at the given *(x, y)* position using the current *textAlign* and
   * *textBaseline* values. If the optional fourth parameter for a maximum width is provided,
   * the text will be scaled to fit that width.
   * @param text The text to render.
   * @param x The x axis of the coordinate for the text starting point.
   * @param y The y axis of the coordinate for the text starting point.
   * @param  maxWidth? The maximum width to draw.
   */
  fillText(text: string, x: number, y: number, maxWidth?: number): void;

  /**
   * Strokes a given text at the given *(x, y)* position using the current *textAlign* and
   * *textBaseline* values. If the optional fourth parameter for a maximum width is provided,
   * the text will be scaled to fit that width.
   * @param text The text to render.
   * @param x The x axis of the coordinate for the text starting point.
   * @param y The y axis of the coordinate for the text starting point.
   * @param  maxWidth? The maximum width to draw.
   */
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;

  /**
   * Fills the current or path with the current fill style using the non-zero or even-odd winding rule.
   * @param fillRule? The algorithm by which to determine if a point is inside a path or outside a path.
   */
  fill(fillRule?: "nonzero" | "evenodd"): void;

  /**
   * Strokes the current path with the current stroke style using the non-zero winding rule.
   */
  stroke(): void;

  /**
   * Returns a *TextMetrics* object that contains information about the measured text.
   * @param text The text to measure.
   */
  text(text: string): TextMetrics;
}

// TODO A plain string can be used as a shorthand, e.g. \`"image.jpg"\` equals \`{src: "image.jpg"}\`.
interface Image {

  /**
   * Image path or URL.
   */
  src?: string;

  /**
   * Image width, extracted from the image file when missing.
   */
  width?: number;

  /**
   * Image height, extracted from the image file when missing.
   */
  height?: number;

  /**
   * Image scale factor - the image will be scaled down by this factor.
   * Ignored when width or height are set.
   */
  scale?: number;
}

type Color = string;

type Font = string;

type LayoutData = any;

type GestureObject = any;

interface Bounds {

  /**
   * the horizontal offset from the parent's left edge in dip
   */
  left?: number;

  /**
   * the vertical offset from the parent's top edge in dip
   */
  top?: number;

  /**
   * the width of the widget in dip
   */
  width?: number;

  /**
   * the height of the widget in dip
   */
  height?: number;

}

interface Transformation {

  /**
   * Clock-wise rotation in radians. Defaults to \`0\`.
   */
   rotation?: number;

  /**
   * Horizontal scale factor. Defaults to \`1\`.
   */
  scaleX?: number;

  /**
   * Vertical scale factor. Defaults to \`1\`.
   */
  scaleY?: number;

  /**
   * Horizontal translation (shift) in dip. Defaults to \`0\`.
   */
  translationX?: number;

  /**
   * Vertical translation (shift) in dip. Defaults to \`0\`.
   */
  translationY?: number;

  /**
   * Z-axis translation (shift) in dip. Defaults to \`0\`. Android 5.0+ only.
   */
  translationZ?: number;

}

type Selector = string;

type dimension = number;

type offset = number;

type margin = any;
`.trim();

module.exports = function(grunt) {

  grunt.registerTask("generate-tsd", function() {
    let defs = readJsonDefs();
    let tsd = createTypeDefs(defs);
    grunt.file.write("build/tabris/tabris.d.ts", tsd);
  });

  function readJsonDefs() {
    let defs = {};
    let doc = grunt.config("doc");
    let files = grunt.file.expand(doc.widgets).concat(grunt.file.expand(doc.api));
    files.forEach((file) => {
      let json = grunt.file.readJSON(file);
      json.file = file;
      defs[json.type || json.object] = json;
    });
    return defs;
  }

  function createTypeDefs(defs) {
    applyIncludes(defs, ["Events", "Properties"]);
    let result = new Text();
    result.append(header);
    result.append("");
    Object.keys(defs).forEach((name) => {
      createTypeDef(result, defs[name], name);
    });
    result.append("");
    return result.toString();
  }

  function applyIncludes(defs, parents) {
    let newParents = [];
    Object.keys(defs).forEach((name) => {
      let def = defs[name];
      if (def.include) {
        // TODO adjust when json defs distiguish extends and includes
        let includes = def.include.filter(include => parents.indexOf(include) !== -1);
        if (includes.length > 0) {
          newParents.push(name);
        }
        includes.forEach(function(include) {
          let incl = defs[include];
          def.events = Object.assign({}, incl.events || {}, def.events);
          def.properties = Object.assign({}, incl.properties || {}, def.properties);
        });
      }
    });
    if (newParents.length > 0) {
      applyIncludes(defs, newParents);
    }
  }

  function createTypeDef(result, def, name) {
    result.append("// " + name);
    result.append("");
    addClass(result, def, name);
    result.append("");
    addPropertyInterface(result, def, name);
    addInstance(result, def, name);
    result.append("");
  }

  function addInstance(result, def, name) {
    if (def.object) {
      result.append("");
      result.append(`declare let ${def.object}: ${name};`);
    }
  }

  function addClass(result, def, name) {
    result.append(createDoc(def));
    result.append(createClassDef(name, def));
    result.indent++;
    addConstructor(result, name);
    addFields(result, def);
    addMethods(result, def);
    addEvents(result, def);
    addPropertyApi(result, def, name);
    result.indent--;
    result.append("}");
  }

  function addConstructor(result, name) {
    result.append("");
    result.append(`constructor(properties?: ${name}Properties);`);
  }

  function createClassDef(name, def) {
    let str = "export class " + name;
    let superClass = getSuperClass(name, def);
    if (superClass) {
      str += " extends " + superClass;
    }
    return str + " {";
  }

  function getSuperClass(name, def) {
    if (def.include) {
      // TODO adjust when json defs distiguish extends and includes
      let includes = def.include.filter(sup => sup !== "Events" && sup !== "Properties");
      if (includes.length > 1) {
        throw new Error("multiple inheritance: " + name);
      }
      if (includes.length === 1) {
        return includes[0];
      }
    }
    return null;
  }

  function addPropertyInterface(result, def, name) {
    result.append(createPropertyInterfaceDef(name, def));
    result.indent++;
    Object.keys(def.properties || []).sort().forEach((name) => {
      result.append("");
      result.append(createProperty(name, def.properties[name]));
    });
    result.indent--;
    result.append("}");
  }

  function createPropertyInterfaceDef(name, def) {
    let str = "interface " + name + "Properties";
    if (def.include) {
      str += " extends " + def.include.map(sup => sup + "Properties").join(", ");
    }
    return str + " {";
  }

  function addFields(result, def) {
    if (def.fields) {
      Object.keys(def.fields).sort().forEach((name) => {
        result.append("");
        result.append(createField(name, def.fields[name]));
      });
    }
  }

  function addMethods(result, def) {
    if (def.methods) {
      Object.keys(def.methods).sort().forEach((name) => {
        if (!Array.isArray(def.methods[name])) {
          throw new Error("method definition not an array", def.type, name);
        }
        def.methods[name].forEach((method) => {
          result.append("");
          result.append(createMethod(name, method));
        });
      });
    }
  }

  function addEvents(result, def) {
    if (def.events) {
      addOffMethods(result, def);
      addOnMethods(result, def);
      addOnceMethods(result, def);
      addTriggerMethod(result);
    }
  }

  function addOffMethods(result, def) {
    result.append("");
    result.append(createComment([
      "Removes all occurrences of *listener* that are bound to *event* and *context* from this widget.",
      "If the context parameter is not present, all matching listeners will be removed.",
      "If the listener parameter is not present, all listeners that are bound to *event* will be removed.",
      "If the event parameter is not present, all listeners for all events will be removed from this widget.",
      "Supports chaining.",
      "@param event",
      "@param listener",
      "@param context"
    ]));
    result.append("off(event?: string, listener?: Function, context?: this): this;");
    Object.keys(def.events).sort().forEach((event) => {
      result.append(createOffMethod(event));
    });
  }

  function createOffMethod(name) {
    return `off(event: "${name}", listener?: Function, context?: this): this;`;
  }

  function addOnMethods(result, def) {
    result.append("");
    result.append(createComment([
      "Adds a *listener* to the list of functions to be notified when *event* is fired. If the context",
      "parameter is not present, the listener will be called in the context of this object. Supports",
      "chaining.",
      "@param event",
      "@param listener",
      "@param context? In the listener function, `this` will point to this object."
    ]));
    result.append("on(event: string, listener: Function, context?: this): this;");
    Object.keys(def.events).sort().forEach((event) => {
      result.append(createOnMethod(event, def.events[event]));
    });
  }

  function createOnMethod(name, def) {
    return `on(event: "${name}", listener: (${createParamList(def.parameters)}) => any): this;`;
  }

  function addOnceMethods(result, def) {
    result.append("");
    result.append(createComment([
      "Same as `on`, but removes the listener after it has been invoked by an event. Supports chaining.",
      "@param event",
      "@param listener",
      "@param context? In the listener function, `this` will point to this object."
    ]));
    result.append("once(event: string, listener: Function, context?: this): this;");
    Object.keys(def.events).sort().forEach((event) => {
      result.append(createOnceMethod(event, def.events[event]));
    });
  }

  function createOnceMethod(name, def) {
    return `once(event: "${name}", listener: (${createParamList(def.parameters)}, context?: this) => any): this;`;
  }

  function addTriggerMethod(result) {
    result.append("");
    result.append(createComment([
      "Triggers an event of the given type. All registered listeners will be notified. Additional parameters",
      "will be passed to the listeners.",
      "@param event",
      "@param ...params"
    ]));
    result.append("trigger(event: string, ...params: any[]): this;");
  }

  function addPropertyApi(result, def, name) {
    if (def.properties) {
      result.append("");
      result.append(createComment([
        "Gets the current value of the given *property*.",
        "@param property"
      ]));
      result.append("get(property: string): any;");
      addGetters(result, def);
      result.append("");
      result.append(createComment([
        "Sets the given property. Supports chaining.",
        "@param property",
        "@param value"
      ]));
      result.append("set(property: string, value: any): this;");
      addSetters(result, def, name);
    }
  }

  function addGetters(result, def) {
    Object.keys(def.properties || []).sort().forEach((name) => {
      result.append("");
      result.append(createGetter(name, def.properties[name]));
    });
  }

  function createGetter(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`get(property: "${name}"): ${def.type};`);
    return result.join("\n");
  }

  function addSetters(result, def, name) {
    result.append("");
    result.append(createComment([
      "Sets all key-value pairs in the properties object as widget properties. Supports chaining.",
      "@param properties"
    ]));
    result.append(`set(properties: ${name}Properties): this;`);
    Object.keys(def.properties || []).sort().forEach((name) => {
      result.append("");
      result.append(createSetter(name, def.properties[name]));
    });
  }

  function createSetter(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`set(property: "${name}", value: ${def.type}): this;`);
    (def.values || []).sort().forEach((value) => {
      result.push(`set(property: "${name}", value: "${value}"): this;`);
    });
    return result.join("\n");
  }

  function createField(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`${name}: ${def.type};`);
    return result.join("\n");
  }

  function createProperty(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`${name}?: ${def.type};`);
    return result.join("\n");
  }


  function createMethod(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`${name}(${createParamList(def.parameters)}): ${def.returns || "void"};`);
    return result.join("\n");
  }

  function createParamList(parameters) {
    return parameters.map(param => `${param.name}: ${param.type}`).join(", ");
  }

  function createDoc(def) {
    if (!def.description && !def.static && !def.provisional) {
      return;
    }
    let result = [];
    if (def.description) {
      splitIntoLines(def.description, 100).forEach((line) => {
        result.push(line);
      });
    }
    if (def.parameters) {
      createParamAnnotations(def.parameters).forEach((line) => {
        result.push(line);
      });
    }
    if (def.static) {
      result.push("@static");
    }
    if (def.provisional) {
      result.push("@provisional");
    }
    return createComment(result);
  }

  function createComment(comment) {
    return ["/**"].concat(comment.map(line => " * " + line), " */").join("\n");
  }
  function createParamAnnotations(params) {
    return params.map(param => `@param ${param.name} ${param.description || ""}`);
  }

  function splitIntoLines(text, maxlen) {
    if (typeof text !== "string") {
      throw new Error("not a string: " + text);
    }
    let linesIn = text.split("\n");
    let linesOut = [];
    for (let lineIn of linesIn) {
      let lineOut = "";
      let words = lineIn.split(" ");
      for (let word of words) {
        if (lineOut.length + word.length > maxlen) {
          linesOut.push(lineOut);
          lineOut = "";
        }
        if (lineOut.length > 0) {
          lineOut += " ";
        }
        lineOut += word;
      }
      if (lineOut.length > 0) {
        linesOut.push(lineOut);
      }
    }
    return linesOut;
  }

  class Text {

    constructor() {
      this.lines = [];
      this.indent = 0;
    }

    append() {
      Array.prototype.forEach.call(arguments, (arg) => {
        let lines = typeof arg === "string" ? arg.split("\n") : arg;
        for (let line of lines) {
          this.lines.push(this._indentLine(line));
        }
      }, this);
    }

    toString() {
      return this.lines.join("\n");
    }

    _indentLine(line) {
      return line.length > 0 ? "  ".repeat(this.indent) + line : line;
    }

  }

};
