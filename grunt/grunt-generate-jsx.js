const {readJsonSync, writeFileSync} = require('fs-extra');

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
  writeFileSync('build/tabris/Jsx.d.ts', tsd);
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
  prepareTypeDefs(defs);
  let result = new Text();
  Object.keys(defs).forEach((name) => {
    addEventsInterface(result, defs[name]);
  });
  result.append('');
  result.append(header);
  result.append('');
  result.indent++;
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

function addEventsInterface(result, def) {
  result.append(createEventsInterfaceDef(def));
  result.indent++;
  addEvents(result, def);
  result.indent--;
  result.append('}');
}

function createEventsInterfaceDef(def) {
  let str = 'interface ' + def.type + 'Events';
  if (def.extends) {
    str += ' extends ' + def.extends + 'Events';
  }
  return str + ' {';
}

function addEvents(result, def) {
  if (def.events) {
    Object.keys(def.events).sort().forEach((name) => {
      result.append('');
      result.append(createEvent(name, def));
    });
  }
}

function createEvent(name, def) {
  let result = [];
  result.push(createDoc(Object.assign({}, def.events[name], {parameters: []})));
  result.push(`on${capitalizeFirstChar(name)}?: (event: tabris.${getEventType(name, def)}) => void;`);
  return result.join('\n');
}

function getEventType(name, def) {
  if (def.events[name].parameters) {
    return (def.events[name].eventObject || (def.type + capitalizeFirstChar(name) + 'Event'));
  } else {
    return `EventObject<tabris.${def.type}>`;
  }
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
  let eventsInterface = `${def.type}Events`;
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
  if (def.deprecated) {
    let message = typeof def.deprecated === 'string' ? `'${def.deprecated}'` : '';
    result.push(`@deprecated(${message})`);
  }
  if (def.static) {
    result.push('@static');
  }
  if (def.provisional) {
    result.push('@provisional');
  }
  return createComment(result);
}

function createComment(comment) {
  return ['/**'].concat(comment.map(line => ' * ' + line), ' */').join('\n');
}

function createParamAnnotations(params) {
  return params.map(param => `@param ${param.name} ${param.description || ''}`);
}

function splitIntoLines(text, maxlen) {
  if (typeof text !== 'string') {
    throw new Error('not a string: ' + text);
  }
  let linesIn = text.split('\n');
  let linesOut = [];
  for (let lineIn of linesIn) {
    let lineOut = '';
    let words = lineIn.split(' ');
    for (let word of words) {
      if (lineOut.length + word.length > maxlen) {
        linesOut.push(lineOut);
        lineOut = '';
      }
      if (lineOut.length > 0) {
        lineOut += ' ';
      }
      lineOut += word;
    }
    if (lineOut.length > 0) {
      linesOut.push(lineOut);
    }
  }
  return linesOut;
}

function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
