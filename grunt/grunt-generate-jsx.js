const {readJsonSync, writeFileSync, ensureDirSync} = require('fs-extra');

const header = `
declare namespace JSX {

  function createElement(type: string|Function, properties: Object, ...children: Array<ElementClass>): ElementClass;

  interface ElementClass extends tabris.Widget { }

  type Element = any;

  interface ElementAttributesProperty {
    jsxProperties: any;
  }
`.trim();

const footer = `
}

`.trim();

exports.generateJsx = function generateJsx({files}) {
  let defs = readJsonDefs(files);
  let tsd = createTypeDefs(defs);
  ensureDirSync('build/typings');
  writeFileSync('build/typings/JSX.d.ts', tsd);
};

function readJsonDefs(files) {
  let defs = {};
  files.forEach((file) => {
    let json = readJsonSync(file);
    json.file = file;
    if (!json.ts_ignore) {
      defs[json.type] = json;
    }
  });
  return defs;
}

function createTypeDefs(defs) {
  let result = new Text();
  result.append(header);
  result.append('');
  result.indent++;
  prepareTypeDefs(defs);
  addInstrinsicElementsInterface(result, defs);
  result.indent--;
  result.append(footer);
  return result.toString();
}

function prepareTypeDefs(defs) {
  Object.keys(defs).forEach((name) => {
    defs[name].isNativeObject = isNativeObject(defs, defs[name]);
    if (defs[name].extends) {
      defs[name].parent = defs[defs[name].extends];
    }
  });
}

function isNativeObject(defs, def) {
  return def && (def.type === 'NativeObject' || isNativeObject(defs, defs[def.extends]));
}

function addInstrinsicElementsInterface(result, defs) {
  result.append('interface IntrinsicElements {');
  result.indent++;
  Object.keys(defs).filter(name => defs[name].isNativeObject).forEach((name) => {
    result.append(createIntrinsicElement(defs[name]));
  });
  result.append('widgetCollection: {}');
  result.indent--;
  result.append('}');
}

function createIntrinsicElement(def) {
  let propetiesInterface = `tabris.${def.type}Properties`;
  let eventsInterface = `tabris.${def.type}JsxEvents`;
  return `${lowercaseFirstChar(def.type)}: ${propetiesInterface} & ${eventsInterface}`;
}

function lowercaseFirstChar(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

class Text {

  constructor() {
    this.lines = [];
    this.indent = 0;
  }

  append() {
    Array.prototype.forEach.call(arguments, (arg) => {
      let lines = typeof arg === 'string' ? arg.split('\n') : arg;
      for (let line of lines) {
        this.lines.push(this._indentLine(line));
      }
    }, this);
  }

  toString() {
    return this.lines.join('\n');
  }

  _indentLine(line) {
    return line.length > 0 ? '  '.repeat(this.indent) + line : line;
  }

}
