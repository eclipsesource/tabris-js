import * as fs from 'fs-extra';
import * as schema from './api-schema';

// TODO: Rename "constructor" property in schema since this name is already used by plain JavaScript objects
type ExtendedApi = schema.Api & Partial<{isNativeObject: boolean, parent: ExtendedApi}>;
type ApiDefinitions = {[name: string]: ExtendedApi};
type Methods = schema.Method | schema.Method[];

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
const eventObjectNames = [EVENT_OBJECT];

exports.generateDts = function generateTsd(config) {
  writeGlobalsDts(config);
  writeTabrisDts(config);
};

//#region read/write

function writeGlobalsDts(config) {
  const apiDefinitions = readJsonDefs(config.files);
  const globalApiDefinitions = filter(apiDefinitions, def => def.namespace && def.namespace === 'global');
  const text = new TextBuilder(config.globalTypeDefFiles.map(file => fs.readFileSync(file)));
  renderDts(text, globalApiDefinitions);
  fs.writeFileSync('build/tabris/globals.d.ts', text.toString());
}

function writeTabrisDts(config) {
  const apiDefinitions = readJsonDefs(config.files);
  const tabrisApiDefinitions = filter(apiDefinitions, def => !def.namespace || def.namespace === 'tabris');
  const text = new TextBuilder([HEADER.replace(/\${VERSION}/g, config.version), config.propertyTypes]);
  renderDts(text, tabrisApiDefinitions);
  fs.writeFileSync('build/tabris/tabris.d.ts', text.toString());
}

function readJsonDefs(files) {
  const defs = {};
  files.forEach(file => {
    const json = fs.readJsonSync(file);
    json.file = file;
    defs[json.type || json.object || json.title] = json;
  });
  return defs as ApiDefinitions;
}

//#endregion

//#region render objects/types

function renderDts(text: TextBuilder, apiDefinitions: ApiDefinitions) {
  extendTypeDefs(apiDefinitions);
  Object.keys(apiDefinitions).forEach(name => {
    renderTypeDefinition(text, apiDefinitions[name]);
  });
  text.append('');
  return text.toString();
}

function renderTypeDefinition(text: TextBuilder, def: ExtendedApi) {
  text.append('// ' + (def.type || def.object || def.title));
  if (def.isNativeObject) {
    text.append('');
    renderPropertiesInterface(text, def);
    text.append('');
    renderEventsInterface(text, def);
    text.append('');
    renderEventObjectInterfaces(text, def);
  }
  text.append('');
  if (def.type) {
    renderClass(text, def);
    renderSingletonVariable(text, def);
  } else {
    renderMethods(text, def);
  }
  text.append('');
}

function renderSingletonVariable(text: TextBuilder, def: ExtendedApi) {
  if (def.object) {
    text.append('');
    const isGlobal = (def.namespace && def.namespace === 'global');
    text.append(`declare ${isGlobal ? 'var' : 'let'} ${def.object}: ${def.type};`);
  }
}

function renderClass(text: TextBuilder, def: ExtendedApi) {
  text.append(createDoc(def));
  renderClassBodyOpen(text, def);
  text.indent++;
  if (def.isNativeObject) {
    text.append('');
    text.append(TS_PROPERTIES_DOC);
    text.append(`public readonly tsProperties: ${def.type}Properties;`);
  }
  renderConstructor(text, def);
  renderMethods(text, def);
  const propertiesFilter = def.isNativeObject ? prop => prop.readonly : () => true;
  renderProperties(text, def, propertiesFilter);
  text.indent--;
  text.append('}');
}

function renderClassBodyOpen(text: TextBuilder, def: ExtendedApi) {
  if (def.isNativeObject) {
    text.append(`interface ${def.type} extends _${def.type}Properties {}`);
  }
  let str = (def.namespace && def.namespace === 'global') ? 'declare' : ' export';
  str += ' class ' + def.type;
  if (def.generics) {
    str += '<' + def.generics + '>';
  }
  if (def.extends) {
    str += ' extends ' + def.extends;
  }
  text.append(str + ' {');
}

function renderConstructor(text: TextBuilder, def: ExtendedApi) {
  const hasConstructor = typeof def.constructor === 'object';
  const constructor = hasConstructor ? def.constructor : getInheritedConstructor(def.parent);
  if (constructor) {
    text.append('');
    const access = constructor.access ? constructor.access + ' ' : '';
    text.append(`${access}constructor(${createParamList(constructor.parameters || [], def.type)});`);
  }
}

//#endregion

//#region render properties interfaces

function renderPropertiesInterface(text: TextBuilder, def: ExtendedApi) {
  text.append(createPropertiesInterfaceBodyOpen(def));
  text.indent++;
  renderProperties(text, def, prop => !prop.readonly);
  text.indent--;
  text.append('}');
  text.append(`type ${def.type}Properties = Partial<_${def.type}Properties>`);
}

function createPropertiesInterfaceBodyOpen(def: ExtendedApi) {
  let str = 'interface _' + def.type + 'Properties';
  if (def.extends) {
    str += ' extends _' + def.extends + 'Properties';
  }
  return str + ' {';
}

//#endregion

//#region render events interfaces

function renderEventsInterface(text: TextBuilder, def: ExtendedApi) {
  text.append(createEventsInterfaceBodyOpen(def));
  text.indent++;
  renderEvents(text, def);
  text.indent--;
  text.append('}');
}

function createEventsInterfaceBodyOpen(def: ExtendedApi) {
  let str = 'interface ' + def.type + 'Events';
  if (def.extends) {
    str += ' extends ' + def.extends + 'Events';
  }
  return str + ' {';
}

function renderEvents(text: TextBuilder, def: ExtendedApi) {
  if (def.events) {
    Object.keys(def.events).sort().forEach(name => {
      text.append('');
      text.append(createEvent(def.type, name, def.events[name]));
    });
  }
  if (def.properties) {
    Object.keys(def.properties).filter(name => !def.properties[name].static).sort().forEach(name => {
      text.append('');
      text.append(createPropertyChangedEvent(def.type, name, def.properties[name]));
    });
  }
}

function createEvent(widgetName: string, eventName, def: schema.Event) {
  const result = [];
  result.push(createDoc(Object.assign({}, def, {parameters: []})));
  result.push(`${eventName}?: (event: ${createEventTypeName(widgetName, eventName, def)}) => void;`);
  return result.join('\n');
}

function createPropertyChangedEvent(widgetName: string, propName: string, def: schema.Property) {
  const result = [];
  const standardDescription = `Fired when the [*${propName}*](#${propName}) property has changed.`;
  const changeEvent = {
    description: def.changeEventDescription || standardDescription,
    parameters: [{
      name: 'value',
      type: def.ts_type || def.type,
      description: `The new value of [*${propName}*](#${propName}).`
    }]
  };
  result.push(createDoc(changeEvent));
  result.push(`${propName}Changed?: (event: PropertyChangedEvent<${widgetName}, ${def.type}>) => void;`);
  return result.join('\n');
}

function renderEventObjectInterfaces(text: TextBuilder, def: ExtendedApi) {
  if (def.events) {
    Object.keys(def.events).filter(name => !!def.events[name].parameters).sort().forEach(name => {
      const eventType = createEventTypeName(def.type, name, def.events[name]);
      if (!eventObjectNames.find(name => name === eventType)) {
        eventObjectNames.push(eventType);
        text.append('');
        renderEventObjectInterface(text, name, def);
      }
    });
  }
}

function renderEventObjectInterface(text: TextBuilder, name: string, def: ExtendedApi) {
  const parameters = def.events[name].parameters || {};
  const eventType = createEventTypeName(def.type, name, def.events[name]);
  text.append(`interface ${eventType} extends EventObject<${def.type}> {`);
  text.indent++;
  Object.keys(parameters).sort().forEach(name => {
    const values = [];
    (parameters[name].values || []).sort().forEach(value => {
      values.push(`"${value}"`);
    });
    const valuesType = (values || []).join(' | ');
    text.append(`readonly ${name}: ${valuesType || parameters[name].type};`);
  });
  text.indent--;
  text.append('}');
}

function createEventTypeName(widgetName: string, eventName: string, def: schema.Event) {
  if (def.parameters) {
    return def.eventObject || (widgetName + capitalizeFirstChar(eventName) + 'Event');
  } else {
    return `EventObject<${widgetName}>`;
  }
}

//#endregion

//#region render members

function renderMethods(text: TextBuilder, def: ExtendedApi) {
  const methods = Object.assign({}, def.methods, overrideClassDependentMethods(def.parent));
  Object.keys(methods).sort().forEach(name => {
    asArray(methods[name]).forEach(method => {
      text.append('');
      text.append(createMethod(name, method, def.type));
    });
  });
}

function renderProperties(text: TextBuilder, def: ExtendedApi, filter: (value) => boolean) {
  if (def.properties) {
    const propertiesFilter = filter ? name => filter(def.properties[name]) : () => true;
    Object.keys(def.properties || {}).filter(propertiesFilter).sort().forEach(name => {
      text.append('');
      text.append(createProperty(name, def.properties[name]));
    });
  }
}

function createProperty(name: string, def: schema.Property) {
  const result = [];
  result.push(createDoc(def));
  const values = [];
  (def.values || []).sort().forEach(value => {
    if (typeof value === 'string') {
      value = `"${value}"`;
    }
    values.push(`${value}`);
  });
  const valuesType = (values || []).join(' | ');
  result.push(`${def.readonly ? 'readonly ' : ''}${name}: ${valuesType || def.ts_type || def.type};`);
  return result.join('\n');
}

function createParamList(parameters: schema.Parameter[], className: string) {
  return parameters.map(param =>
    `${param.name}${param.optional ? '?' : ''}: ${decodeParamType(param.ts_type || param.type, className)}`
  ).join(', ');
}

function decodeParamType(type: string, className: string) {
  switch (type) {
    case (PROPERTIES_OBJECT):
      return className + 'Properties';

    case (EVENTS_OBJECT):
      return className + 'Events';

    default:
      return type;
  }
}

function createDoc(documentable: ExtendedApi | schema.Property | schema.Method | schema.Event | schema.Event) {
  const def = documentable as Partial<ExtendedApi & schema.Property & schema.Method & schema.Event & schema.Event>;
  if (!def.description && !def.static && !def.provisional) {
    return;
  }
  const result: string[] = [];
  if (def.description) {
    splitIntoLines(def.description, 100).forEach(line => {
      result.push(line);
    });
  }
  if (def.parameters) {
    createParamAnnotations(def.parameters).forEach(line => {
      result.push(line);
    });
  }
  if (def.static) {
    result.push('@static');
  }
  if (def.provisional) {
    result.push('@provisional');
  }
  return createComment(result);
}

function createComment(comment: string[]) {
  return ['/**'].concat(comment.map(line => ' * ' + line), ' */').join('\n');
}

function createParamAnnotations(params: schema.Parameter[]) {
  return params.map(param => {
    const name = param.name.startsWith('...') ? param.name.slice(3) : param.name;
    const description = param.description || '';
    return `@param ${name} ${description}`;
  });
}

//#endregion

//#region definitions helper

function extendTypeDefs(defs: ApiDefinitions) {
  Object.keys(defs).forEach(name => {
    defs[name].isNativeObject = isNativeObject(defs, defs[name]);
    if (defs[name].extends) {
      defs[name].parent = defs[defs[name].extends];
    }
  });
}

function overrideClassDependentMethods(def: ExtendedApi) {
  const result = {};
  if (def) {
    Object.keys(def.methods || {})
      .filter(methodName => isClassDependent(def.methods[methodName]))
      .forEach(methodName => result[methodName] = def.methods[methodName]);
    Object.assign(result, overrideClassDependentMethods(def.parent));
  }
  return result as ExtendedApi;
}

function isClassDependent(method: Methods) { // methods with parameters that must be adjusted in each subclass
  const variants = asArray(method);
  return variants.some(variant =>
    (variant.parameters || []).some(param => CLASS_DEPENDENT_TYPES.includes(param.ts_type || param.type))
  );
}

function createMethod(name: string, def: schema.Method, className) {
  const result = [];
  result.push(createDoc(def));
  const declaration = (className ? (def.protected ? 'protected ' : '') : 'declare function ')
    + `${name}${def.generics ? `<${def.generics}>` : ''}`
    + `(${createParamList(def.parameters, className)}): ${def.ts_returns || def.returns || 'void'};`;
  result.push(declaration);
  return result.join('\n');
}

function getInheritedConstructor(def: ExtendedApi): typeof def.constructor {
  if (!def) {
    return null;
  }
  if (typeof def.constructor === 'object') {
    return def.constructor;
  }
  return def.parent ? getInheritedConstructor(def.parent) : null;
}

function isNativeObject(defs, def) {
  return def && (def.type === 'NativeObject' || isNativeObject(defs, defs[def.extends]));
}

//#endregion

//#region text and array helper

function splitIntoLines(text: string, maxLength: number) {
  const linesIn = text.split('\n');
  const linesOut = [];
  for (const lineIn of linesIn) {
    let lineOut = '';
    const words = lineIn.split(' ');
    for (const word of words) {
      if (lineOut.length + word.length > maxLength) {
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

function capitalizeFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class TextBuilder {

  public lines: string[];
  public indent: number;

  constructor(initial?: string[]) {
    this.lines = initial || [];
    this.indent = 0;
  }

  public append(...args: string[]) {
    Array.prototype.forEach.call(arguments, arg => {
      const lines = typeof arg === 'string' ? arg.split('\n') : arg;
      for (const line of lines) {
        this.lines.push(this._indentLine(line));
      }
    }, this);
  }

  public toString() {
    return this.lines.join('\n');
  }

  private _indentLine(line) {
    return line.length > 0 ? '  '.repeat(this.indent) + line : line;
  }

}

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function filter<T>(obj: T, filterFunction): T {
  return Object.keys(obj)
    .filter(key => filterFunction(obj[key]))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {}) as T;
}

//#endregion
