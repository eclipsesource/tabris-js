const {readJsonSync, writeFileSync, readFileSync} = require('fs-extra');

const HEADER = `
// Type definitions for Tabris.js \${VERSION}
/// <reference path="globals.d.ts" />
/// <reference path="Jsx.d.ts" />

type TypeScriptPropertiesKey = 'tsProperties';

type Properties<T extends NativeObject, U extends keyof T = TypeScriptPropertiesKey> = T[U];

type Partial<T, U extends keyof T = keyof T> = {
  [P in U]?: T[P]
};

export as namespace tabris;
`;

const TS_PROPERTIES_DOC = `
/**
 * The type of this property defines the interface used by \`set\`, \`get\`, and
 * the \`Properties\` interface. It's value is always undefined.
 */`;

const PROPERTIES_OBJECT = 'PropertiesObject';
const EVENTS_OBJECT = 'EventsObject';
const EVENT_OBJECT = 'EventObject<T>';
const CLASS_DEPENDENT_TYPES = [EVENTS_OBJECT];
let eventObjectNames = [EVENT_OBJECT];

exports.generateTsd = function generateTsd({files, propertyTypes, globalTypeDefFiles, version}) {
  let defs = readJsonDefs(files);
  let globalDefs = filter(defs, def => def.namespace && def.namespace === 'global');
  let globals = globalTypeDefFiles.map((file) => readFileSync(file));
  globals.push(createTypeDefs(globalDefs));
  writeFileSync('build/tabris/globals.d.ts', globals.join('\n'));
  let tabrisDefs = filter(defs, def => !def.namespace || def.namespace === 'tabris');
  let tsd = [HEADER.replace(/\${VERSION}/g, version), propertyTypes];
  tsd.push(createTypeDefs(tabrisDefs));
  writeFileSync('build/tabris/tabris.d.ts', tsd.join('\n'));
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
      defs[json.type || json.object || json.title] = json;
    }
  });
  return defs;
}

function createTypeDefs(defs) {
  let result = new Text();
  prepareTypeDefs(defs);
  Object.keys(defs).forEach((name) => {
    createTypeDef(result, defs[name]);
  });
  result.append('');
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

function createTypeDef(result, def) {
  result.append('// ' + (def.type || def.object || def.title));
  if (def.isNativeObject) {
    result.append('');
    addPropertyInterface(result, def);
    result.append('');
    addEventsInterface(result, def);
    result.append('');
    addEventObjectInterfaces(result, def);
  }
  result.append('');
  if (def.type) {
    addClass(result, def);
    addInstance(result, def);
  } else {
    addMethods(result, def);
  }
  result.append('');
}

function addInstance(result, def) {
  if (def.object) {
    result.append('');
    let isGlobal = (def.namespace && def.namespace === 'global');
    result.append(`declare ${isGlobal ? 'var' : 'let'} ${def.object}: ${def.type};`);
  }
}

function addClass(result, def) {
  result.append(createDoc(def));
  addClassDef(result, def);
  result.indent++;
  if (def.isNativeObject) {
    result.append('');
    result.append(TS_PROPERTIES_DOC);
    result.append(`public readonly tsProperties: ${def.type}Properties;`);
  }
  addConstructor(result, def);
  addMethods(result, def);
  let propertiesFilter = def.isNativeObject ? prop => prop.readonly : () => true;
  addProperties(result, def, propertiesFilter);
  result.indent--;
  result.append('}');
}

function addConstructor(result, def) {
  let hasConstructor = typeof def.constructor === 'object';
  let constructor = hasConstructor ? def.constructor : inheritConstructor(def.parent);
  if (constructor) {
    result.append('');
    let access = constructor.access ? constructor.access + ' ' : '';
    result.append(`${access}constructor(${createParamList(constructor.parameters || [], def.type)});`);
  }
}

function inheritConstructor(def) {
  if (!def) {
    return null;
  }
  if (typeof def.constructor === 'object') {
    return def.constructor;
  }
  return def.parent ? inheritConstructor(def.parent) : null;
}

function addClassDef(result, def) {
  if (def.isNativeObject) {
    result.append(`interface ${def.type} extends _${def.type}Properties {}`);
  }
  let str = (def.namespace && def.namespace === 'global') ? 'declare' : ' export';
  str += ' class ' + def.type;
  if (def.generics) {
    str += '<' + def.generics + '>';
  }
  if (def.extends) {
    str += ' extends ' + def.extends;
  }
  result.append(str + ' {');
}

function addPropertyInterface(result, def) {
  result.append(createPropertyInterfaceDef(def));
  result.indent++;
  addProperties(result, def, prop => !prop.readonly);
  result.indent--;
  result.append('}');
  result.append(`type ${def.type}Properties = Partial<_${def.type}Properties>`);
}

function createPropertyInterfaceDef(def) {
  let str = 'interface _' + def.type + 'Properties';
  if (def.extends) {
    str += ' extends _' + def.extends + 'Properties';
  }
  return str + ' {';
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

function createEvent(widgetName, eventName, def) {
  let result = [];
  result.push(createDoc(Object.assign({}, def, {parameters: []})));
  result.push(`${eventName}?: (event: ${getEventType(widgetName, eventName, def)}) => void;`);
  return result.join('\n');
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
  result.push(`${propName}Changed?: (event: PropertyChangedEvent<${widgetName}, ${def.type}>) => void;`);
  return result.join('\n');
}

function addEventObjectInterfaces(result, def) {
  if (def.events) {
    Object.keys(def.events).filter(name => !!def.events[name].parameters).sort().forEach((name) => {
      let eventType = getEventType(def.type, name, def.events[name]);
      if (!eventObjectNames.find(name => name === eventType)) {
        eventObjectNames.push(eventType);
        result.append('');
        addEventObjectInterface(result, name, def);
      }
    });
  }
}

function addEventObjectInterface(result, name, def) {
  let parameters = def.events[name].parameters || {};
  let eventType = getEventType(def.type, name, def.events[name]);
  result.append(`interface ${eventType} extends EventObject<${def.type}> {`);
  result.indent++;
  Object.keys(parameters).sort().forEach(name => {
    let values = [];
    (parameters[name].values || []).sort().forEach((value) => {
      values.push(`"${value}"`);
    });
    let valuesType = (values || []).join(' | ');
    result.append(`readonly ${name}: ${valuesType || parameters[name].type};`);
  });
  result.indent--;
  result.append('}');
}

function getEventType(widgetName, eventName, def) {
  if (def.parameters) {
    return def.eventObject || (widgetName + capitalizeFirstChar(eventName) + 'Event');
  } else {
    return `EventObject<${widgetName}>`;
  }
}

function addMethods(result, def) {
  let methods = Object.assign({}, def.methods, inheritClassDependentMethods(def.parent));
  Object.keys(methods).sort().forEach((name) => {
    if (Array.isArray(methods[name])) {
      methods[name].forEach((method) => {
        result.append('');
        result.append(createMethod(name, method, def.type));
      });
    } else {
      result.append('');
      result.append(createMethod(name, methods[name], def.type));
    }
  });
}

function inheritClassDependentMethods(def) {
  let result = {};
  if (def) {
    Object.keys(def.methods || {})
      .filter(methodName => isClassDependent(def.methods[methodName]))
      .forEach(methodName => result[methodName] = def.methods[methodName]);
    Object.assign(result, inheritClassDependentMethods(def.parent));
  }
  return result;
}

function isClassDependent(method) { // methods with parameters that must be adjusted in each subclass
  let variants = Array.isArray(method) ? method : [method];
  return variants.some(variant =>
    (variant.parameters || []).some(param => CLASS_DEPENDENT_TYPES.includes(param.ts_type || param.type))
  );
}

function createMethod(name, def, className) {
  let result = [];
  result.push(createDoc(def));
  let declaration = (className ? (def.protected ? 'protected ' : '') : 'declare function ')
    + `${name}${def.generics ? `<${def.generics}>` : ''}`
    + `(${createParamList(def.parameters, className)}): ${def.ts_returns || def.returns || 'void'};`;
  result.push(declaration);
  return result.join('\n');
}

function addProperties(result, def, filter) {
  if (def.properties) {
    let propertiesFilter = filter ? name => filter(def.properties[name]) : () => true;
    Object.keys(def.properties || {}).filter(propertiesFilter).sort().forEach((name) => {
      result.append('');
      result.append(createProperty(name, def.properties[name]));
    });
  }
}

function createProperty(name, def) {
  let result = [];
  result.push(createDoc(def));
  let values = [];
  (def.values || []).sort().forEach((value) => {
    if (typeof value === 'string') {
      value = `"${value}"`;
    }
    values.push(`${value}`);
  });
  let valuesType = (values || []).join(' | ');
  result.push(`${def.readonly ? 'readonly ' : ''}${name}: ${valuesType || def.ts_type || def.type};`);
  return result.join('\n');
}

function createParamList(parameters, className) {
  return parameters.map(param =>
    `${param.name}${param.optional ? '?' : ''}: ${decodeType(param.ts_type || param.type, className)}`
  ).join(', ');
}

function decodeType(type, className) {
  switch (type) {
    case (PROPERTIES_OBJECT):
      return className + 'Properties';

    case (EVENTS_OBJECT):
      return className + 'Events';

    default:
      return type;
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
  return params.map(param => {
    let name = param.name.startsWith('...') ? param.name.slice(3) : param.name;
    let description = param.description || '';
    return `@param ${name} ${description}`;
  });
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
