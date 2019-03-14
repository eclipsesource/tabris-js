import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  TextBuilder, asArray, filter, ApiDefinitions, ExtendedApi, Methods,
  readJsonDefs, createDoc, getEventTypeName, capitalizeFirstChar, Properties
} from './common';

type PropertyOps = {hasContext: boolean, excludeConsts: boolean};

const HEADER = `
// Type definitions for Tabris.js \${VERSION}
/// <reference path="globals.d.ts" />

// General helper types
interface Constructor<T> {new(...args: any[]): T; }
type ParamType<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : any;
type ReadOnly<T extends keyof any> = Partial<Record<T, never>>;
type Diff<T, U> = T extends U ? never : T;
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type MethodKeysOf<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type IfEquals<X, Y, A, B> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;
type ReadOnlyKeysOf<T> = {
    [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
}[keyof T];

// Tabris.js Helper Types
export type Properties<
  T extends {set?: any},
  U = Omit<T, 'set'> // prevent self-reference issues
> = Partial<Omit<U, MethodKeysOf<U> | ReadOnlyKeysOf<U>>>
  & {cid?: never}; // prevent empty object type as possible result, would allow any object
type ListenersKeysOf<T> = { [K in keyof T]: T[K] extends Listeners ? K : never }[keyof T];
type UnpackListeners<T> = T extends Listeners<infer U> ? Listener<U> : T;
type ListenersMap<T> = { [Key in ListenersKeysOf<T>]?: UnpackListeners<T[Key]>};
export type JSXProperties<
  T extends {set?: any; jsxProperties?: any},
  U = Omit<T, 'set' | 'jsxProperties'> // prevent self-reference issues
> = Properties<U> & ListenersMap<U>;
type ExtendedEvent<EventData, Target = {}> = EventObject<Target> & EventData;
type Listener<T = {}> = (ev: ExtendedEvent<T>) => any;
type ListenersTriggerParam<T> = {[P in Diff<keyof T, keyof EventObject<object>>]: T[P]};
type MinimalEventObject<T extends object> = {target: T};
type TargetType<E extends object> = E extends MinimalEventObject<infer Target> ? Target : object;
export interface Listeners<EventData extends object = MinimalEventObject<object>> {
  // tslint:disable-next-line:callable-types
  (listener: Listener<ExtendedEvent<EventData>>): TargetType<EventData>;
}
export type JSXChildren<T extends Widget> = T|WidgetCollection<T>|Array<T|WidgetCollection<T>>|undefined;
export type SFC<T> = (attributes: object|null, children: any[]) => T;
type Flatten<T> = T|Array<T>|undefined;

export as namespace tabris;
`.trim();

const EVENT_OBJECT = 'EventObject<T>';
const eventObjectNames = [EVENT_OBJECT];

type Config = {files: string[], globalTypeDefFiles: string[], localTypeDefFiles: string, version: string};

exports.generateDts = function generateTsd(config: Config) {
  writeGlobalsDts(config);
  writeTabrisDts(config);
};

//#region read/write

function writeGlobalsDts(config: Config) {
  const apiDefinitions = readJsonDefs(config.files);
  const globalApiDefinitions = filter(apiDefinitions, def => def.namespace && def.namespace === 'global');
  const text = new TextBuilder(config.globalTypeDefFiles.map(file => fs.readFileSync(file)));
  renderDts(text, globalApiDefinitions);
  fs.writeFileSync('build/tabris/globals.d.ts', text.toString());
}

function writeTabrisDts(config: Config) {
  const apiDefinitions = readJsonDefs(config.files);
  const tabrisApiDefinitions = filter(apiDefinitions, def => !def.namespace || def.namespace === 'tabris');
  const text = new TextBuilder([HEADER.replace(/\${VERSION}/g, config.version), config.localTypeDefFiles]);
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
    if (def.namespace && def.namespace === 'global') {
      text.append(`declare var ${def.object}: ${def.type};`);
    } else {
      text.append(`export const ${def.object}: ${def.type};`);
    }
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
  str += ' class ' + genericType(def);
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
      const eventType = getEventTypeName(def, name, def.events[name].parameters);
      if (!eventObjectNames.find(eventObjectName => eventObjectName === eventType)) {
        eventObjectNames.push(eventType);
        text.append('');
        renderEventObjectInterface(text, name, def);
      }
    });
  }
}

function renderEventObjectInterface(text: TextBuilder, name: string, def: ExtendedApi) {
  const parameters = def.events[name].parameters || {};
  text.append(
    `export interface ${getEventTypeName(def, name, parameters)}<Target = ${def.generics ? 'object' : def.type}>`
  );
  text.append(` extends EventObject<Target>`);
  text.append(`{`);
  text.indent++;
  Object.keys(parameters).sort().forEach(param => {
    const values = [];
    (parameters[param].values || []).sort().forEach(value => {
      values.push(`'${value}'`);
    });
    text.append(`readonly ${param}: ${union(values) || parameters[param].ts_type || parameters[param].type};`);
  });
  text.indent--;
  text.append('}');
}

//#endregion

//#region render members

function renderMethods(text: TextBuilder, def: ExtendedApi) {
  Object.keys(def.methods || {}).sort().forEach(name => {
    asArray(def.methods[name]).forEach(method => {
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
  Object.keys(def.properties || {}).sort().forEach(name => {
    text.append('');
    text.append(createProperty(name, def.properties, def));
  });
  if (def.statics && def.statics.properties) {
    Object.keys(def.statics.properties || {}).sort().forEach(name => {
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
        text.append(createEventProperty(def, name));
      });
    }
    if (def.properties) {
      Object.keys(def.properties).filter(name => !def.properties[name].const).sort().forEach(name => {
        text.append('');
        text.append(createPropertyChangedEventProperty(def, name));
      });
    }
  }
}

function createEventProperty(def: ExtendedApi, eventName: string) {
  const event = def.events[eventName];
  const result = [];
  result.push(createDoc(Object.assign({}, event, {parameters: []})));
  result.push(`on${capitalizeFirstChar(eventName)}: `
    + `Listeners<${getEventTypeName(def, eventName, event.parameters)}<this>>;`);
  return result.join('\n');
}

function createPropertyChangedEventProperty(def: ExtendedApi, propName: string) {
  const property = def.properties[propName];
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
    + `Listeners<PropertyChangedEvent<this, ${defType}>>;`);
  return result.join('\n');
}

function createProperty(name: string, properties: Properties, def: ExtendedApi, isStatic: boolean = false) {
  const result = [];
  const property = properties[name];
  result.push(createDoc(property));
  const readonly = property.readonly;
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
  return param.ts_type || param.type;
}

function union(values: Array<string|number|boolean>) {
  return (values || []).sort().map(value => typeof value === 'string' ? `'${value}'` : `${value}`).join(' | ');
}

//#endregion

function getInheritedConstructor(def: ExtendedApi): typeof def.constructor {
  if (!def) {
    return null;
  }
  if (typeof def.constructor === 'object') {
    return def.constructor;
  }
  return def.parent ? getInheritedConstructor(def.parent) : null;
}

function genericType(def: ExtendedApi) {
  let result = def.type;
  if (def.generics) {
    result += '<' + def.generics + '>';
  }
  return result;
}
