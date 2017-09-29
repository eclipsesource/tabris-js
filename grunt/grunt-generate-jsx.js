const {readJsonSync, writeFileSync} = require('fs-extra');

const BASIC_TYPES = ['boolean', 'number', 'string', 'symbol', 'any', 'Object'];

const header = `
type Image = tabris.Image;
type Selector = tabris.Selector;

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
  let tsd = createTypeDefs(filter(defs, def => !def.namespace || def.namespace === 'tabris'));
  writeFileSync('build/tabris/Jsx.d.ts', tsd);
};

function filter(obj, filterFunction) {
  return Object.keys(obj)
    .filter(key => filterFunction(obj[key]))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}

function readJsonDefs(files) {
  let defs = {};
  files.forEach((file) => {
    let json = readJsonSync(file);
    json.file = file;
    if (!json.ts_ignore) {
      defs[json.type || json.object || json.  title] = json;
    }
  });
  return defs;
}

function createTypeDefs(defs) {
  prepareTypeDefs(defs);
  let result = new Text();
  Object.keys(defs).forEach((name) => {
    addEventsInterface(result, defs[name]);
    result.append('');
  });
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
  if (def.isNativeObject) {
    if (def.events) {
      Object.keys(def.events).sort().forEach((name) => {
        result.append('');
        result.append(createEvent(def.type, name, def.events[name]));
      });
    }
    if (def.properties) {
      Object.keys(def.properties).filter(name => !def.properties[name].static).sort().forEach(name => {
        result.append('');
        result.append(createPropertyChangedEvent(def.type, name, def.properties[name]));
      });
    }
  }
}

function createEvent(widgetName, eventName, def) {
  let result = [];
  result.push(createDoc(Object.assign({}, def, {parameters: []})));
  result.push(`on${capitalizeFirstChar(eventName)}?: `
    + `(event: tabris.${getEventType(widgetName, eventName, def)}) => void;`);
  return result.join('\n');
}

function getEventType(widgetName, eventName, def) {
  if (def.parameters) {
    return (def.eventObject || (widgetName + capitalizeFirstChar(eventName) + 'Event'));
  } else {
    return `EventObject<tabris.${widgetName}>`;
  }
}

function createPropertyChangedEvent(widgetName, propName, def) {
  let result = [];
  let standardDescription = `Fired when the [*${propName}*](#${propName}) property has changed.`;
  let changeEvent = {
    description: def.changeEventDescription || standardDescription,
    parameters: [{
      name: 'value',
      type: def.type,
      description: `The new value of [*${propName}*](#${propName}).`
    }]
  };
  result.push(createDoc(changeEvent));
  let type = (isBasicType(def.type) ? '' : 'tabris.') + def.type;
  result.push(`on${capitalizeFirstChar(propName)}Changed?: `
    + `(event: tabris.PropertyChangedEvent<tabris.${widgetName}, ${type}>) => void;`);
  return result.join('\n');
}

function isBasicType(type) {
  let isBasicType = type[0] === '{' || type[0] === '(';
  for (let basicType of BASIC_TYPES) {
    isBasicType |= type.startsWith(basicType);
  }
  return isBasicType;
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
