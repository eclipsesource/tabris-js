import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  TextBuilder, asArray, filter, ApiDefinitions, ExtendedApi, Methods,
  readJsonDefs, createDoc, createEventTypeName
} from './common';

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

//#endregion

//#region render objects/types

function renderDts(text: TextBuilder, apiDefinitions: ApiDefinitions) {
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

function createEvent(widgetName: string, eventName, event: schema.Event) {
  const result = [];
  result.push(createDoc(Object.assign({}, event, {parameters: []})));
  result.push(`${eventName}?: (event: ${createEventTypeName(widgetName, eventName, event)}) => void;`);
  return result.join('\n');
}

function createPropertyChangedEvent(widgetName: string, propName: string, property: schema.Property) {
  const result = [];
  const standardDescription = `Fired when the [*${propName}*](#${propName}) property has changed.`;
  const changeEvent = {
    description: property.changeEventDescription || standardDescription,
    parameters: [{
      name: 'value',
      type: property.ts_type || property.type,
      description: `The new value of [*${propName}*](#${propName}).`
    }]
  };
  result.push(createDoc(changeEvent));
  result.push(`${propName}Changed?: (event: PropertyChangedEvent<${widgetName}, ${property.type}>) => void;`);
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

function createMethod(name: string, method: schema.Method, className) {
  const result = [];
  result.push(createDoc(method));
  const declaration = (className ? (method.protected ? 'protected ' : '') : 'declare function ')
    + `${name}${method.generics ? `<${method.generics}>` : ''}`
    + `(${createParamList(method.parameters, className)}): ${method.ts_returns || method.returns || 'void'};`;
  result.push(declaration);
  return result.join('\n');
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

function createProperty(name: string, property: schema.Property) {
  const result = [];
  result.push(createDoc(property));
  const values = [];
  (property.values || []).sort().forEach(value => {
    if (typeof value === 'string') {
      value = `"${value}"`;
    }
    values.push(`${value}`);
  });
  const valuesType = (values || []).join(' | ');
  result.push(`${property.readonly ? 'readonly ' : ''}${name}: ${valuesType || property.ts_type || property.type};`);
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

//#endregion

//#region definitions helper

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

function getInheritedConstructor(def: ExtendedApi): typeof def.constructor {
  if (!def) {
    return null;
  }
  if (typeof def.constructor === 'object') {
    return def.constructor;
  }
  return def.parent ? getInheritedConstructor(def.parent) : null;
}

//#endregion
