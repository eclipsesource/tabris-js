/*jshint -W097 */
"use strict";

let header = `
// Type definitions for Tabris.js v1.8

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

interface CanvasContext {
  // TODO
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
    applyIncludes(defs);
    let result = new Text();
    result.append(header);
    result.append("");
    Object.keys(defs).forEach((name) => {
      createTypeDef(result, defs[name], name);
    });
    result.append("");
    return result.toString();
  }

  function applyIncludes(defs) {
    Object.keys(defs).forEach((name) => {
      let def = defs[name];
      if (def.include) {
        // TODO adjust when json defs distiguish extends and includes
        let includes = def.include.filter(name => name === "Events" || name === "Properties");
        includes.forEach(function(name) {
          let incl = defs[name];
          def.methods = Object.assign({}, incl.methods || {}, def.methods);
          def.events = Object.assign({}, incl.events || {}, def.events);
        });
      }
    });
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
      result.append("");
      result.append("on(event: string, listener: Function, context?: this): this;");
      Object.keys(def.events).sort().forEach((event) => {
        result.append("");
        result.append(createEvent(event, def.events[event]));
      });
    }
  }

  function addPropertyApi(result, def, name) {
    if (def.properties) {
      result.append("");
      result.append("/**\n"
                  + " * Gets the current value of the given *property*.\n"
                  + " * @param property\n"
                  + " */\n"
                  + "get(property: string): any;");
      addGetters(result, def, name);
      result.append("");
      result.append("/**\n"
                  + " * Sets the given property. Supports chaining.\n"
                  + " * @param property\n"
                  + " * @param value\n"
                  + " */\n"
                  + "set(property: string, value: any): this;");
      result.append("");
      result.append("/**\n"
                  + " * Sets all key-value pairs in the properties object as widget properties. Supports chaining."
                  + " * @param properties\n"
                  + "*/\n"
                  + `set(properties: ${name}Properties): this;`);
      addSetters(result, def, name);
    }
  }

  function addGetters(result, def, name) {
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
    Object.keys(def.properties || []).sort().forEach((name) => {
      result.append("");
      result.append(createSetter(name, def.properties[name]));
    });
  }

  function createSetter(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`set(property: "${name}", value: ${def.type}): this;`);
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

  function createEvent(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`on(event: "${name}", listener: (${createParamList(def.parameters)}) => any): this;`);
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
    return ["/**"].concat(result.map(line => " * " + line), " */").join("\n");
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
