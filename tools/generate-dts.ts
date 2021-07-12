import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  TextBuilder, asArray, filter, ApiDefinitions, ExtendedApi, readJsonDefs, createDoc, getEventTypeName, isMap,
  capitalizeFirstChar, Properties, hasChangeEvent, isInterfaceReference, isUnion, isTuple, isIndexedMap,
  isCallback, plainType
} from './common';

const NEWLESS = `
This constructor can be called as a factory, without "new". Doing so allows \
passing an attributes object which may include (in addition to the properties) \
children, event listeners and layout shorthands.
`.trim();

const FACTORY_DOC = `
/**
 * Creates an instance of this type.
 *
 * The given attributes object may include properties,
 * event listener and children, if supported.
 *
 * The second parameter should be given if this is the
 * return value of a functional component. In this case the
 * component itself (factory function) must be given to make it
 * a valid selector for the widget selector API such as
 * "$()" or the composite "find()" method.
 */
`;

const HEADER = `
// Type definitions for Tabris.js \${VERSION}
/// <reference path="globals.d.ts" />

// General helper types
export interface Constructor<T> {new(...args: any[]): T; }
type Omit<T, K extends string | symbol | number> = Pick<T, Exclude<keyof T, K>>;
type ReadOnlyWidgetKeys<T> = T extends {readonly bounds: any}
  ? Extract<keyof T, 'bounds' | 'absoluteBounds' | 'cid' | 'jsxAttributes'>
  : never;
type MethodKeysOf<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
// Tabris.js Helper Types
type JSXDefaultChildren = Flatten<string|{cid?: never} & object>;
export type Properties<
  T extends {set?: any},
  U = Omit<T, 'set'> // prevent self-reference issues
> = Partial<Omit<U, MethodKeysOf<U> | ReadOnlyWidgetKeys<U>>>
  & {cid?: never, data?: any}; // prevent empty object type as possible result, would allow any object
type ListenersKeysOf<T> = { [K in keyof T]: T[K] extends Listeners<any> ? K : never }[keyof T];
export type UnpackListeners<T> = T extends Listeners<infer U> ? Listener<U> : T;
export type EventOfListeners<T extends Listeners<any>> = T extends Listeners<infer U> ? U : never;
type ListenersMap<T> = { [Key in ListenersKeysOf<T>]?: UnpackListeners<T[Key]>};
export type JSXShorthands<T> = T extends {layoutData?: LayoutDataValue}
  ? {center?: true, stretch?: true, stretchX?: true, stretchY?: true}
  : {};
export type JSXCandidate = {set: any; jsxAttributes: any}; // JSX.Element?
export type JSXAttributes<
  T extends JSXCandidate,
  U = Omit<T, 'set' | 'jsxAttributes'> // prevent self-reference issues
> = Properties<U> & ListenersMap<U> & JSXShorthands<U>;

/**
 * The attributes object for the given widget type, includes all properties,
 * events, children and shorthands. To be passed to a JSX element or new-less
 * widget constructor call.
 *
 * The optional second parameter is the type of the "data" property.
 */
export type Attributes<T extends JSXCandidate, TData = any> = T['jsxAttributes'] & {data?: TData};

export type JSXCompositeAttributes<T extends Composite, U extends Widget>
  = JSXAttributes<T> & {apply?: RuleSet<T>, children?: JSXChildren<U>};
type ExtendedEvent<EventData, Target = {}> = EventObject<Target> & EventData;
export type Listener<T = {}> = (ev: ExtendedEvent<T>) => any;
type ListenersTriggerParam<T> = Omit<T, keyof EventObject<any>>;
type MinimalEventObject<T extends object> = {target: T};
type TargetType<E extends object> = E extends MinimalEventObject<infer Target> ? Target : object;
export interface Listeners<EventData extends {target: object}> {
  // tslint:disable-next-line:callable-types
  (listener: Listener<ExtendedEvent<EventData>>): TargetType<EventData>;
}
export type JSXChildren<T extends Widget> = T|WidgetCollection<T>|Array<T|WidgetCollection<T>>|{cid?: never}|undefined;
export type SFC<T> = (attributes: object|null, children: any[]) => T;
type Flatten<T> = T|Array<T>|undefined;

export type Factory<
  OriginalConstructor extends Constructor<JSXCandidate> & {prototype: Instance},
  Instance extends JSXCandidate = InstanceType<OriginalConstructor>,
  Selector extends Function = (...args: any[]) => Widget
> = {
  ${FACTORY_DOC}
  (attributes?: Attributes<Instance>, selector?: Selector): Instance
};

export type CallableConstructor<
  OriginalConstructor extends Constructor<JSXCandidate> & {prototype: Instance},
  Instance extends JSXCandidate = InstanceType<OriginalConstructor>,
  Selector extends Function = (...args: any[]) => Widget
> = {
  /** ${NEWLESS} */
  new (...args: ConstructorParameters<OriginalConstructor>): Instance,
  ${FACTORY_DOC}
  (attributes?: Attributes<Instance>, selector?: Selector): Instance,
  prototype: Instance
};

export as namespace tabris;
`.trim();

const EVENT_OBJECT = 'EventObject<T>';
const eventObjectNames = [EVENT_OBJECT];

type Config = {files: string, globalTypeDefFiles: string[], localTypeDefFiles: string, version: string};

exports.generateDts = function generateTsd(config: Config) {
  writeGlobalsDts(config);
  writeTabrisDts(config);
};

// #region read/write

function writeGlobalsDts(config: Config) {
  const apiDefinitions = filter(readJsonDefs(config.files), def => !def.markdown_only);
  const globalApiDefinitions = filter(apiDefinitions, def => def.namespace && def.namespace === 'global');
  const text = new TextBuilder(config.globalTypeDefFiles.map(file => fs.readFileSync(file, {encoding: 'utf-8'})));
  renderDts(text, globalApiDefinitions);
  fs.writeFileSync('build/tabris/globals.d.ts', text.toString());
}

function writeTabrisDts(config: Config) {
  const apiDefinitions = filter(readJsonDefs(config.files), def => !def.markdown_only);
  const tabrisApiDefinitions = filter(apiDefinitions, def => !def.namespace || def.namespace === 'tabris');
  const text = new TextBuilder([HEADER.replace(/\${VERSION}/g, config.version), config.localTypeDefFiles]);
  renderDts(text, tabrisApiDefinitions);
  fs.writeFileSync('build/tabris/tabris.d.ts', text.toString());
}

// #endregion

// #region render objects/types

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
  renderClassHeader(text, def);
  renderClassConstructor(text, def);
  renderMethods(text, def);
  renderProperties(text, def);
  renderEventProperties(text, def);
  renderClassFooter(text, def);
  if (def.supportsFactory) {
    renderTypeAlias(text, def);
    renderFactory(text, def);
  }
}

function renderClassHeader(text: TextBuilder, def: ExtendedApi) {
  if (def.supportsFactory) {
    text.append('export namespace widgets {');
    text.append('');
    text.indent++;
  }
  text.append(createDoc(def));
  let str = (def.namespace && def.namespace === 'global') ? 'declare' : 'export';
  str += def.interface ? ' interface ' : ' class ';
  str += genericType(def);
  if (def.extends) {
    str += ' extends ';
    str += toTypeScript(def.extends);
  }
  text.append(str + ' {');
  text.indent++;
}

function renderClassFooter(text: TextBuilder, def: ExtendedApi) {
  text.indent--;
  text.append('}');
  if (def.supportsFactory) {
    text.indent--;
    text.append('}');
    text.append('');
  }
  text.append('');
}

function renderClassConstructor(text: TextBuilder, def: ExtendedApi) {
  const hasConstructor = typeof def.constructor === 'object';
  const constructor = hasConstructor ? def.constructor : getInheritedConstructor(def.superAPI);
  if (constructor) {
    text.append('');
    const access = constructor.access ? constructor.access + ' ' : '';
    const paramList = createParamList(def, constructor.parameters || []);
    text.append(createDoc(def, def.isWidget || def.isPopup ? NEWLESS : ''));
    text.append(`${access}constructor(${paramList});`);
  }
}

function renderTypeAlias(text: TextBuilder, def: ExtendedApi) {
  text.append(
    `export type ${def.type}${renderGenericsDef(def.generics)} = `
    + `widgets.${def.type}${renderGenerics(def.generics)};`
  );
}

function renderFactory(text: TextBuilder, def: ExtendedApi) {
  const hasConstructor = typeof def.constructor === 'object';
  const constructorDef = hasConstructor ? def.constructor : getInheritedConstructor(def.superAPI);
  if (!constructorDef) {
    throw new Error('Can not render a separate constructor function without super constructor');
  }
  const _class = 'widgets.' + def.type;
  const constructor = def.type + 'Constructor';
  const factory = def.type + 'Factory';
  text.append(`export type ${constructor} = typeof ${_class};`);
  // The "CallableConstructor" interface is not used here since it can not support static members
  text.append(`export interface ${factory} extends Factory<${constructor}>, ${constructor} {}`);
  text.append(`export const ${def.type}: ${factory};`);
}

// #endregion

// #region render events interfaces

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
  const hasGenerics = def.generics?.some(entry => !entry.default);
  const target = hasGenerics ? 'object' : plainType(def.type);
  if (hasGenerics) {
    throw new Error('Generics types without default can not have specialized events');
  }
  text.append(
    `export interface ${getEventTypeName(def, name, parameters)}<Target = ${target}>`
  );
  text.append(' extends EventObject<Target>');
  text.append('{');
  text.indent++;
  Object.keys(parameters).sort().forEach(param => {
    const values = [];
    (parameters[param].values || []).sort().forEach(value => {
      values.push(`'${value}'`);
    });
    text.append(
      `readonly ${param}: ${union(values) || toTypeScript(parameters[param].ts_type || parameters[param].type)};`
    );
  });
  text.indent--;
  text.append('}');
}

// #endregion

// #region render members

function renderMethods(text: TextBuilder, def: ExtendedApi) {
  Object.keys(def.methods || {}).sort().forEach(name => {
    asArray(def.methods[name]).filter(method => !method.docs_only).forEach(method => {
      text.append('');
      text.append(createMethod(name, method, def));
    });
  });
  if (def.statics && def.statics.methods) {
    Object.keys(def.statics.methods).sort().forEach(name => {
      asArray(def.statics.methods[name]).filter(method => !method.docs_only).forEach(method => {
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
  const paramList = createParamList(def, method.parameters);
  const define = def.namespace === 'global' ? 'declare' : 'export';
  const declaration = (def.type ? createMethodModifiers(method, isStatic) : define + ' function ')
    + `${name}${renderGenericsDef(method.generics)}`
    + `(${paramList}): ${toTypeScript(method.ts_returns || method.returns || 'void')};`;
  result.push(declaration);
  return result.join('\n');
}

function createMethodModifiers(method: schema.Method, isStatic: boolean) {
  return accessor(method) + (isStatic ? 'static ' : '');
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
      Object.keys(def.properties)
        .filter(name => hasChangeEvent(def.properties[name]))
        .sort()
        .forEach(
          name => {
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
  result.push(createDoc({
    description: property.changeEventDescription || standardDescription
  }));
  result.push(`on${capitalizeFirstChar(propName)}Changed: `
    + `ChangeListeners<this, '${propName}'>;`);
  return result.join('\n');
}

function createProperty(name: string, properties: Properties, def: ExtendedApi, isStatic: boolean = false) {
  const result = [];
  const property = properties[name];
  result.push(createDoc(property));
  const readonly = property.readonly ? 'readonly ' : '';
  const _static = isStatic ? 'static ' : '';
  const optional = property.optional ? '?' : '';
  const type = decodeType(property);
  if (property.separateAccessors) {
    result.push(
      `${accessor(property)}${_static}get ${name}(): ${type};`
    );
    result.push('\n\n');
    if (!property.readonly) {
      result.push('\n\n');
      result.push(
        `${accessor(property)}${_static}set ${name}(value: ${type});`
      );
    }
  } else {
    result.push(
      `${accessor(property)}${_static}${readonly}${name}${optional}: ${type};`
    );
  }
  return result.join('\n');
}

function createParamList(def: ExtendedApi, parameters: schema.Parameter[]) {
  return (parameters || []).map(param =>
    `${param.name}${param.optional ? '?' : ''}: ${decodeType(param)}`
  ).join(', ');
}

function decodeType(param: Partial<schema.Parameter & schema.Property>) {
  if (param.values) {
    return union(param.values);
  }
  return toTypeScript(param.ts_type || param.type);
}

function union(values: Array<string | number | boolean>) {
  return (values || []).sort().map(value => typeof value === 'string' ? `'${value}'` : `${value}`).join(' | ');
}

// #endregion

function getInheritedConstructor(def: ExtendedApi): typeof def.constructor {
  if (!def) {
    return null;
  }
  if (typeof def.constructor === 'object') {
    return def.constructor;
  }
  return def.superAPI ? getInheritedConstructor(def.superAPI) : null;
}

function genericType(def: ExtendedApi) {
  let result = def.type;
  if (def.generics) {
    result += renderGenericsDef(def.generics);
  }
  return result;
}

function accessor(def: {protected?: boolean, private?: boolean}) {
  if (def.protected) {
    return 'protected ';
  }
  if (def.private) {
    return 'private ';
  }
  return '';
}

function toTypeScript(ref: schema.TypeReference): string {
  if (typeof ref === 'string') {
    return ref;
  }
  if (isInterfaceReference(ref)) {
    if (ref.interface === 'Array' && ref.generics.every(type => typeof type === 'string')) {
      return ref.generics[0] + '[]';
    }
    return ref.interface + renderGenerics(ref.generics);
  }
  if (isUnion(ref)) {
    return ref.union.map(toTypeScript).join(' | ');
  }
  if (isTuple(ref)) {
    return '[' + ref.tuple.map(toTypeScript).join(', ') + ']';
  }
  if (isMap(ref)) {
    const {map} = ref;
    const content = Object.keys(map).map(key =>
      `${key}${map[key].optional ? '?' : ''}: ${toTypeScript(map[key].ts_type || map[key].type)}`
    ).join(', ');
    return '{' + content + '}';
  }
  if (isIndexedMap(ref)) {
    const name = Object.keys(ref.map)[0];
    const indexType = ref.indexType === 'SelectorString' ? 'string' : ref.indexType;
    return `{[${name}: ${indexType}]: ${toTypeScript(ref.map[name])}}`;
  }
  if (isCallback(ref)) {
    const parameters = ref.callback.map(
      arg => arg.name + ':' + toTypeScript(arg.type)
    ).join(', ');
    return `((${parameters}) => ${toTypeScript(ref.returns.type)})`;
  }
  throw new Error('Can not convert to TypeScript: ' + JSON.stringify(ref));
}

function renderGenericsDef(generics: schema.GenericsDef): string {
  if (!generics) {
    return '';
  }
  const content = generics.map(({name, extends: ext, default: def}) =>
    name + (ext ? ` extends ${toTypeScript(ext)}` : '') + (def ? ` = ${toTypeScript(def)}` : '')
  ).join(', ');
  return '<' + content + '>';
}

function renderGenerics(generics: schema.Generics | schema.GenericsDef): string {
  if (!generics) {
    return '';
  }
  const list = (generics as unknown[]).map(param => {
    if (typeof param === 'string') {
      return param;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = (param as any).name;
    if (typeof name === 'string') {
      return name;
    }
    return toTypeScript(param as schema.TypeReference);
  });
  return '<' + list.join(', ') + '>';
}
