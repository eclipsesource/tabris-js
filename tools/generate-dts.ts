import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  TextBuilder, asArray, filter, ApiDefinitions, ExtendedApi, Methods,
  readJsonDefs, createDoc, createEventTypeName, isNativeObject
} from './common';

type PropertyOps = {hasContext: boolean, excludeStatics: boolean};

const HEADER = `
// Type definitions for Tabris.js \${VERSION}
/// <reference path="globals.d.ts" />
/// <reference path="Jsx.d.ts" />

interface Constructor<T> {new(...args: any[]): T; }
type Omit<T, U> = Pick<T, Exclude<keyof T, U>>;
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type NativeObjectProperties<T extends NativeObject> = Partial<Omit<T, FunctionPropertyNames<T> | 'cid'>>;
type Properties<T extends Widget> = Partial<Omit<T, FunctionPropertyNames<T> | 'bounds' | 'data' | 'cid'>>;
type ParamType<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : any;
type SettableProperties<T extends NativeObject> = ParamType<T['set']>;
type ExtendedEvent<EventData, Target = {}> = EventObject<Target> & EventData;
type Listener<T = {}> = (ev: ExtendedEvent<T>) => any;
type Diff<T, U> = T extends U ? never : T;
type ListenersTriggerParam<T> = {[P in Diff<keyof T, keyof EventObject<object>>]: T[P]};
type MinimalEventObject<T extends object> = {target: T};
type TargetType<E extends object> = E extends MinimalEventObject<infer Target> ? Target : object;

interface Listeners<EventData extends object = MinimalEventObject<object>> {
  // tslint:disable-next-line:callable-types
  (listener: Listener<ExtendedEvent<EventData>>): TargetType<EventData>;
}

export as namespace tabris;
`;

const PROPERTIES_OBJECT = 'PropertiesObject';
const EVENTS_OBJECT = 'EventsObject';
const EVENT_OBJECT = 'EventObject<T>';
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
    renderEventsInterface(text, def);
    text.append('');
    if (def.type !== 'NativeObject') {
      text.append(`type ${def.type}Properties = ${createPropertiesObject(def, {hasContext: false, excludeStatics: false})};`);
    }
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
  renderClassHead(text, def);
  text.indent++;
  renderConstructor(text, def);
  renderMethods(text, def);
  renderProperties(text, def, () => true);
  text.indent--;
  text.append('}');
}

function renderClassHead(text: TextBuilder, def: ExtendedApi) {
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
    const paramList = createParamList(def, constructor.parameters || [], {hasContext: false, excludeStatics: false});
    text.append(`${access}constructor(${paramList});`);
  }
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
  result.push(`${propName}Changed?: (event: PropertyChangedEvent<${widgetName}, ${property.ts_type || property.type}>) => void;`);
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
  const methods = Object.assign({}, def.methods, getClassDependentMethods(def));
  Object.keys(methods).sort().forEach(name => {
    asArray(methods[name]).forEach(method => {
      text.append('');
      text.append(createMethod(name, method, def));
    });
  });
}

function createMethod(
  name: string, method: schema.Method, def: ExtendedApi
) {
  const result = [];
  result.push(createDoc(method));
  const paramList = createParamList(def, method.parameters, {hasContext: true, excludeStatics: true});
  const declaration = (def.type ? (method.protected ? 'protected ' : '') : 'declare function ')
    + `${name}${method.generics ? `<${method.generics}>` : ''}`
    + `(${paramList}): ${method.ts_returns || method.returns || 'void'};`;
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
  const readonly = property.readonly || property.static;
  result.push(`${readonly ? 'readonly ' : ''}${name}: ${valuesType || property.ts_type || property.type};`);
  return result.join('\n');
}

function createParamList(def: ExtendedApi, parameters: schema.Parameter[], ops: PropertyOps) {
  return (parameters || []).map(param =>
    `${param.name}${param.optional ? '?' : ''}: ${decodeParamType(param, def, ops)}`
  ).join(', ');
}

function decodeParamType(param: schema.Parameter, def: ExtendedApi, ops: PropertyOps) {
  switch (param.type) {
    case (PROPERTIES_OBJECT):
      return createPropertiesObject(def, ops);

    case (EVENTS_OBJECT):
      return def.type + 'Events';

    default:
      return param.ts_type || param.type;
  }
}

function createPropertiesObject(def: ExtendedApi, ops: PropertyOps) {
  const hasNoProperties = def.type === 'NativeObject'
    || (def.parent.type === 'NativeObject' && !hasSettableProperties(def, ops));
  if (hasNoProperties) {
    return 'never';
  }
  const removeProps = readOnlyPropertiesOf(def).concat(ops.excludeStatics ? staticPropertiesOf(def) : []);
  const addProps = functionPropertiesOf(def);
  const genericType = def.isWidget ? 'Properties' : 'NativeObjectProperties';
  const baseType = ops.hasContext ? 'this' : def.type;
  return remove(`${genericType}<${baseType}>`, removeProps) + add(baseType, addProps);
}

function add(type: string, props: string[]) {
  if (!props || !props.length) {
    return '';
  }
  return ` & Partial<Pick<${type}, '${props.join(`' | '`)}'>>`;
}

function remove(type: string, props: string[]) {
  if (!props || !props.length) {
    return type;
  }
  return `Omit<${type}, '${props.join(`' | '`)}'>`;
}

//#endregion

//#region definitions helper

function getClassDependentMethods(def: ExtendedApi) {
  const result: Methods = {};
  let baseType = def;
  while (baseType && baseType.parent)  {
    baseType = baseType.parent;
    Object.keys(baseType.methods || {})
      .filter(methodName => isClassDependent(def, baseType.methods[methodName]))
      .forEach(methodName => result[methodName] = baseType.methods[methodName]);
  }
  return result;
}

function isClassDependent(def: ExtendedApi, method: Methods) { // methods with parameters that must be adjusted in some subclasses
  const variants = asArray(method);
  return variants.some(variant =>
    (variant.parameters || []).some(param => isClassDependentParameter(def, param))
  );
}

function isClassDependentParameter(def: ExtendedApi, parameter: schema.Parameter) {
  const autoExtendable = def.isWidget
    && def.type !== 'Widget'
    && !hasReadOnlyProperties(def)
    && !hasFunctionProperties(def)
    && !hasStaticProperties(def);
  const newProps = Object.keys(def.properties || {}).filter(prop => !def.properties[prop].readonly);
  return parameter.type === EVENTS_OBJECT || (parameter.type === PROPERTIES_OBJECT && newProps && !autoExtendable);
}

function hasReadOnlyProperties(def: ExtendedApi) {
  return readOnlyPropertiesOf(def).length > 0;
}

function hasStaticProperties(def: ExtendedApi) {
  return staticPropertiesOf(def).length > 0;
}

function hasFunctionProperties(def: ExtendedApi) {
  return functionPropertiesOf(def).length > 0;
}

function hasSettableProperties(def: ExtendedApi, ops: PropertyOps) {
  return settablePropertiesOf(def, ops).length > 0;
}

function readOnlyPropertiesOf(def: ExtendedApi): string[] {
  if (def.type === 'NativeObject' || def.type === 'Widget') {
    return []; // The read-only properties of these are excluded via generic types "Properties" and "NativeObjectProperties"
  }
  return Object.keys(def.properties || {}).filter(prop => def.properties[prop].readonly);
}

function functionPropertiesOf(def: ExtendedApi): string[] {
  return Object.keys(def.properties || {}).filter(prop => def.properties[prop].type.indexOf('=>') !== -1);
}

function staticPropertiesOf(def: ExtendedApi): string[] {
  return Object.keys(def.properties || {}).filter(prop => def.properties[prop].static);
}

function settablePropertiesOf(def: ExtendedApi, {excludeStatics}: PropertyOps) {
  return Object.keys(def.properties || {})
    .filter(prop => !def.properties[prop].readonly && (!excludeStatics || !def.properties[prop].static));
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
