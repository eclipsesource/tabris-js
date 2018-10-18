import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  TextBuilder, asArray, filter, ApiDefinitions, ExtendedApi, Methods,
  readJsonDefs, createDoc, createEventTypeName, capitalizeFirstChar, Properties
} from './common';

type PropertyOps = {hasContext: boolean, excludeConsts: boolean};

const HEADER = `
// Type definitions for Tabris.js \${VERSION}
/// <reference path="globals.d.ts" />

interface Constructor<T> {new(...args: any[]): T; }
type UnpackListeners<T> = T extends Listeners<infer U> ? Listener<U> : T;
type JSXProperties<T, U extends keyof T> = { [Key in U]?: UnpackListeners<T[Key]>};
type ParamType<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : any;
type SettableProperties<T> = T extends NativeObject ? ParamType<T['set']> : {};
type ConstructorParam<T extends {new(properties: object): any; }> = T extends {new(properties: infer P): any; } ? P :any
type Properties<T>
  =   T extends NativeObject ? SettableProperties<T>
    : T extends {new(properties: object): NativeObject; } ? ConstructorParam<T>
    : T extends {prototype: T} ? SettableProperties<T>
    : never;
type ExtendProperties<Base, Target, Filter extends keyof Target> = Properties<Base> & Partial<Pick<Target, Filter>>;
type ReadOnly<T extends keyof any> = Partial<Record<T, never>>;
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
`.trim();

const PROPERTIES_OBJECT = 'PropertiesObject';
const JSX_PROPERTIES_OBJECT = 'JsxPropertiesObject';
const JSX_FACTORY = 'JSX.JsxFactory';
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
  text.append('');
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
  renderProperties(text, def);
  renderEventProperties(text, def);
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
    str += ' extends ' + (def.ts_extends || def.extends);
  }
  text.append(str + ' {');
}

function renderConstructor(text: TextBuilder, def: ExtendedApi) {
  const hasConstructor = typeof def.constructor === 'object';
  const constructor = hasConstructor ? def.constructor : getInheritedConstructor(def.parent);
  if (constructor) {
    text.append('');
    const access = constructor.access ? constructor.access + ' ' : '';
    const paramList = createParamList(def, constructor.parameters || [], {hasContext: false, excludeConsts: false});
    text.append(`${access}constructor(${paramList});`);
  }
}

//#endregion

//#region render events interfaces

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
      values.push(`'${value}'`);
    });
    text.append(`readonly ${name}: ${union(values) || parameters[name].ts_type || parameters[name].type};`);
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
  if (def.statics && def.statics.methods) {
    Object.keys(def.statics.methods).sort().forEach(name => {
      asArray(def.statics.methods[name]).forEach(method => {
        text.append('');
        text.append(createMethod(name, method, def, true));
      });
    });
  }
}

function createMethod(
  name: string, method: schema.Method, def: ExtendedApi, isStatic: boolean = false
) {
  const result = [];
  result.push(createDoc(method));
  const paramList = createParamList(def, method.parameters, {hasContext: true, excludeConsts: true});
  const declaration = (def.type ? createMethodModifiers(method, isStatic) : 'declare function ')
    + `${name}${method.generics ? `<${method.generics}>` : ''}`
    + `(${paramList}): ${method.ts_returns || method.returns || 'void'};`;
  result.push(declaration);
  return result.join('\n');
}

function createMethodModifiers(method: schema.Method, isStatic: boolean) {
  return (method.protected ? 'protected ' : '') + (isStatic ? 'static ' : '');
}

function renderProperties(text: TextBuilder, def: ExtendedApi) {
  const properties = Object.assign({}, def.properties, getClassDependentProperties(def));
  const filter = name => name !== '[JSX.jsxFactory]' || def.constructor.access !== 'protected';
  Object.keys(properties || {}).filter(filter).sort().forEach(name => {
    text.append('');
    text.append(createProperty(name, properties, def));
  });
  if (def.statics && def.statics.properties) {
    Object.keys(def.statics.properties || {}).filter(filter).sort().forEach(name => {
      text.append('');
      text.append(createProperty(name, def.statics.properties, def, true));
    });
  }
}

function renderEventProperties(text: TextBuilder, def: ExtendedApi) {
  if (def.isNativeObject) {
    if (def.events) {
      Object.keys(def.events).sort().forEach(name => {
        text.append('');
        text.append(createEventProperty(def.type, name, def.events[name]));
      });
    }
    if (def.properties) {
      Object.keys(def.properties).filter(name => !def.properties[name].const).sort().forEach(name => {
        text.append('');
        text.append(createPropertyChangedEventProperty(def.type, name, def.properties[name]));
      });
    }
  }
}


function createEventProperty(widgetName: string, eventName: string, event: schema.Event) {
  const result = [];
  result.push(createDoc(Object.assign({}, event, {parameters: []})));
  result.push(`on${capitalizeFirstChar(eventName)}: `
    + `Listeners<${createEventTypeName(widgetName, eventName, event)}>;`);
  return result.join('\n');
}

function createPropertyChangedEventProperty(widgetName: string, propName: string, property: schema.Property) {
  const result = [];
  const standardDescription = `Fired when the [*${propName}*](#${propName}) property has changed.`;
  const defType = property.ts_type || property.type;
  const changeEvent = {
    description: property.changeEventDescription || standardDescription,
    parameters: [{
      name: 'value',
      type: defType,
      description: `The new value of [*${propName}*](#${propName}).`
    }]
  };
  result.push(createDoc(changeEvent));
  result.push(`on${capitalizeFirstChar(propName)}Changed: `
    + `Listeners<PropertyChangedEvent<tabris.${widgetName}, ${defType}>>;`);
  return result.join('\n');
}

function createProperty(name: string, properties: Properties, def: ExtendedApi, isStatic: boolean = false) {
  const result = [];
  const property = properties[name];
  result.push(createDoc(property));
  const readonly = property.readonly || property.const;
  const type = decodeType(property, def, {hasContext: false, excludeConsts: false});
  result.push(`${isStatic ? 'static ' : ''}${readonly ? 'readonly ' : ''}${name}: ${type};`);
  return result.join('\n');
}

function createParamList(def: ExtendedApi, parameters: schema.Parameter[], ops: PropertyOps) {
  return (parameters || []).map(param =>
    `${param.name}${param.optional ? '?' : ''}: ${decodeType(param, def, ops)}`
  ).join(', ');
}

function decodeType(param: Partial<schema.Parameter & schema.Property>, def: ExtendedApi, ops: PropertyOps) {
  if (param.values) {
    return union(param.values);
  }
  switch (param.type) {
    case (JSX_PROPERTIES_OBJECT):
      return createJsxPropertiesObject(def);

    case (PROPERTIES_OBJECT):
      return createPropertiesObject(def, ops);

    case (JSX_FACTORY):
      return def.constructor.access !== 'public' ? 'never' : param.type;

    default:
      return param.ts_type || param.type;
  }
}

function createPropertiesObject(def: ExtendedApi, ops: PropertyOps) {
  const newProps = settablePropertiesOf(def, ops);
  const neverProps = readOnlyPropertiesOf(def)
    .concat(ops.excludeConsts ? constPropertiesOf(def) : [])
    .filter(onlyUnique)
    .filter(name => !name.startsWith('['));
  const excludes = neverProps.length ? ` & ReadOnly<${union(neverProps)}>` : '';
  if (!def.parent && !newProps.length) {
    return `{[key: string]: any}${excludes}`;
  } else if (!def.parent && newProps.length) {
    return `{[key: string]: any} & Partial<Pick<${def.type}, ${union(newProps)}>>${excludes}`;
  } else if (def.parent && !newProps.length) {
    return `Properties<${def.parent.type}>${excludes}`;
  }
  return `ExtendProperties<${def.parent.type}, ${def.type}, ${union(newProps)}>${excludes}`;
}

function createJsxPropertiesObject(def: ExtendedApi) {
  const forbidden = def.constructor.access !== 'public' && def.parent && def.parent.constructor.access === 'public';
  const inherit = def.isWidget && def.parent.type !== 'NativeObject';
  const parentType = def.ts_extends || def.extends;
  const props = jsxPropertiesOf(def).concat(!inherit ? jsxPropertiesOf(def.parent) : []);
  const children = def.jsxChildren ? ` & {children?: ${def.jsxChildren}}` : '';
  if (forbidden) {
    return 'never';
  } else if (inherit && props.length) {
    return `${parentType}['jsxProperties'] & JSXProperties<${def.type}, ${union(props)}>${children}`;
  } else if (inherit && !props.length) {
    return `${parentType}['jsxProperties']${children}`;
  } else if (!inherit && props.length) {
    return `JSXProperties<${def.type}, ${union(props)}>${children}`;
  }
  return `{}${children}`;
}

function union(values: any[]) {
  return (values || []).sort().map(value => typeof value === 'string' ? `'${value}'` : `${value}`).join(' | ');
}

function remove(type: string, props: string[]) {
  if (!props || !props.length) {
    return type;
  }
  return `Omit<${type}, ${union(props)}>`;
}

//#endregion

//#region definitions helper

function getClassDependentMethods(def: ExtendedApi) {
  const result: Methods = {};
  let baseType = def;
  while (baseType && baseType.parent)  {
    baseType = baseType.parent;
    Object.keys(baseType.methods || {})
      .filter(methodName => isClassDependentMethod(def, baseType.methods[methodName]))
      .forEach(methodName => result[methodName] = baseType.methods[methodName]);
  }
  return result;
}

function getClassDependentProperties(def: ExtendedApi) {
  const result: Properties = {};
  let baseType = def;
  while (baseType && baseType.parent)  {
    baseType = baseType.parent;
    Object.keys(baseType.properties || {})
      .filter(propertyName => isClassDependentProperty(def, baseType.properties[propertyName]))
      .forEach(propertyName => result[propertyName] = baseType.properties[propertyName]);
  }
  return result;
}

function isClassDependentMethod(def: ExtendedApi, method: Methods) { // methods with parameters that must be adjusted in some subclasses
  const variants = asArray(method);
  return variants.some(variant =>
    (variant.parameters || []).some(param => isClassDependentParameter(def, param))
  );
}

function isClassDependentProperty(def: ExtendedApi, property: schema.Property): boolean {
  if (property.type === JSX_FACTORY) {
    return (def.constructor.access === 'public' && def.parent && def.parent.constructor.access === 'protected')
      || (def.constructor.access === 'private' && def.parent && def.parent.constructor.access === 'public');
  }
  return property.type === JSX_PROPERTIES_OBJECT;
}

function isClassDependentParameter(def: ExtendedApi, parameter: schema.Parameter) {
  if (parameter.type === PROPERTIES_OBJECT) {
    const autoExtendable = def.isWidget
      && !hasReadOnlyProperties(def)
      && !hasFunctionProperties(def)
      && !hasConstProperties(def);
    const newProps = Object.keys(def.properties || {}).filter(prop => !def.properties[prop].readonly);
    return newProps && !autoExtendable;
  }
  return false;
}

function hasReadOnlyProperties(def: ExtendedApi) {
  return readOnlyPropertiesOf(def).length > 0;
}

function hasConstProperties(def: ExtendedApi) {
  return constPropertiesOf(def).length > 0;
}

function hasFunctionProperties(def: ExtendedApi) {
  return functionPropertiesOf(def).length > 0;
}

function hasSettableProperties(def: ExtendedApi, ops: PropertyOps) {
  return settablePropertiesOf(def, ops).length > 0;
}

function readOnlyPropertiesOf(def: ExtendedApi): string[] {
  return Object.keys(def.properties || {}).filter(prop => def.properties[prop].readonly);
}

function functionPropertiesOf(def: ExtendedApi): string[] {
  return Object.keys(def.properties || {}).filter(prop => def.properties[prop].type.indexOf('=>') !== -1);
}

function constPropertiesOf(def: ExtendedApi): string[] {
  return Object.keys(def.properties || {}).filter(prop => def.properties[prop].const);
}

function jsxPropertiesOf(def: ExtendedApi) {
  if (!def) {
    return [];
  }
  return settablePropertiesOf(def, {excludeConsts: false})
    .concat(Object.keys(def.events || {}).map(name => `on${capitalizeFirstChar(name)}`))
    .concat(settablePropertiesOf(def, {excludeConsts: true}).map(name => `on${capitalizeFirstChar(name)}Changed`));
}

function settablePropertiesOf(def: ExtendedApi, {excludeConsts}: Partial<PropertyOps>) {
  if (!def) {
    return [];
  }
  return Object.keys(def.properties || {})
    .filter(prop => !def.properties[prop].readonly && (!excludeConsts || !def.properties[prop].const));
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

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

//#endregion
