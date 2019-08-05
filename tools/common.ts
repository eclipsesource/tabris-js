import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {TypeReference} from './api-schema';
import {join} from 'path';

const doNotCapitalize = {
  any: true,
  null: true,
  undefined: true,
  object: true,
  string: true,
  number: true,
  boolean: true,
  this: true
};

// TODO: Rename "constructor" property in schema since this name is already used by plain JavaScript objects
export type ExtendedApi = schema.Api & Partial<{
  isNativeObject: boolean,
  superAPI: ExtendedApi,
  file: string,
  isWidget: boolean
  isPopup: boolean,
  jsxParents: string[],
  jsxChildren: string[]
}>;
export type ApiDefinitions = {[name: string]: ExtendedApi};
export type Methods = schema.Method | schema.Method[];
export type Properties = {[name: string]: schema.Property};
export type NamedType = {name: string, type: TypeReference};

export function capitalizeType(type: string) {
  if (type.indexOf('=>') !== -1) {
    return type; // currently there is no case where this needs to be changed
  }
  return type.split('|').map(part => {
    const testType = part.endsWith('[]') ? part.slice(0, -2) : part;
    return doNotCapitalize[testType] ? part : capitalizeFirstChar(part);
  }).join('|');
}

export function capitalizeFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstChar(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export class TextBuilder {

  public lines: string[];
  public indent: number;

  constructor(initial?: string[]) {
    this.lines = initial || [];
    this.indent = 0;
  }

  public append(...args: string[]) {
    Array.prototype.forEach.call(arguments, arg => {
      const lines = typeof arg === 'string' ? arg.split('\n') : arg || [];
      for (const line of lines) {
        this.lines.push(this._indentLine(line));
      }
    }, this);
  }

  public toString() {
    return this.lines.join('\n');
  }

  private _indentLine(line: string) {
    return line.length > 0 ? '  '.repeat(this.indent) + line : line;
  }

}

export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function filter<T>(obj: T, filterFunction: (v: ExtendedApi) => boolean): T {
  return Object.keys(obj)
    .filter(key => filterFunction(obj[key]))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {}) as T;
}

export function readJsonDefs(path: string) {
  const defs = {};
  const files = fs.readdirSync(path)
    .filter(file => file.endsWith('.json'))
    .map(file => join(path, file));
  files.forEach(file => {
    const def = fs.readJsonSync(file);
    def.file = file;
    const title = getKey(def);
    if (defs[title]) {
      throw new Error('Duplicate entry ' + title);
    }
    defs[title] = def;
  });
  extendTypeDefs(defs);
  return defs as ApiDefinitions;
}

export function getKey(def: ExtendedApi): string {
  return def.type || def.object || def.title;
}

export function getTitle(def: ExtendedApi): string {
  return def.title || def.object || def.type;
}

export function createDoc(documentable: ExtendedApi | schema.Property | schema.Method | schema.Event | schema.Event) {
  const def = documentable as Partial<ExtendedApi & schema.Property & schema.Method & schema.Event & schema.Event>;
  if (!def.description && !def.const && !def.provisional) {
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
  if (def.const) {
    result.push('@constant');
  }
  if (def.provisional) {
    result.push('@provisional');
  }
  return createComment(result);
}

export function hasChangeEvent(property: schema.Property, isStatic: boolean = false) {
  return !isStatic && !property.const && !property.noChangeEvent && !property.protected && !property.private;
}

export function getJSXChildType(def: ExtendedApi, type: schema.TypeReference): string {
  const jsxType = resolveGenerics(def, type);
  if (isInterfaceReference(jsxType) && jsxType.interface === 'Array') {
    return plainType(jsxType.generics[0]);
  } else {
    throw new Error('JSX Children type must be array');
  }
}

export function supportsJsx(def: ExtendedApi) {
  return (def.isWidget || def.extends === 'Popup' || (def.properties || {}).jsxAttributes)
      && def.constructor.access === 'public';
}

function createComment(comment: string[]) {
  return ['/**'].concat(comment.map(line => ' * ' + line), ' */').join('\n');
}

function createParamAnnotations(params: schema.Parameter[]) {
  return params.map(param => {
    const name = param.name.startsWith('...') ? param.name.slice(3) : param.name;
    const description = param.description || '';
    return `@param ${name} ${description}`.trim();
  });
}

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

function extendTypeDefs(defs: ApiDefinitions) {
  Object.keys(defs).forEach(name => {
    defs[name].isNativeObject = isOfType(defs, defs[name], 'NativeObject');
    defs[name].isWidget = isOfType(defs, defs[name], 'Widget');
    defs[name].isPopup = isOfType(defs, defs[name], 'Popup');
    const ext = plainType(defs[name].extends);
    if (ext) {
      defs[name].superAPI = defs[ext];
    }
    defs[name].jsxChildren = getJsxChildren(defs, name);
    defs[name].jsxChildren.forEach(childType => {
      const jsxParents = defs[childType].jsxParents = defs[childType].jsxParents || [];
      jsxParents.push(name);
    });
  });
}

function getJsxChildren(defs: ApiDefinitions, name: string): string[] {
  const def = defs[name];
  if (!supportsJsx(def) || def.type === 'CollectionView') {
    return [];
  }
  if (def.type === 'Composite' || def.extends === 'Composite') {
    return ['Widget']; // Listing all would be too verbose
  }
  const result = [];
  if (isInterfaceReference(def.extends) && def.extends.interface === 'Composite') {
    const childTypeParam = resolveGenerics(def, def.extends.generics[0]);
    if (isUnion(childTypeParam)) {
      childTypeParam.union.forEach(subType => {
        result.push(...getAllOfType(defs, subType));
      });
    } else if (plainType(childTypeParam)) {
      result.push(...getAllOfType(defs, childTypeParam));
    }
  }
  // Non-Widget Child Elements:
  Object.keys(def.properties || {})
    .map(propName => def.properties[propName])
    .filter(prop => prop.jsxContentProperty && prop.type !== 'string')
    .forEach(prop => result.push(getJSXChildType(def, prop.type)));
  return result;
}

function getAllOfType(defs: ApiDefinitions, type: schema.TypeReference): string[] {
  return Object.keys(defs).filter(name => isOfType(defs, defs[name], plainType(type)));
}

function resolveGenerics(def: ExtendedApi, type: schema.TypeReference): schema.TypeReference {
  if (!type) {
    return type;
  }
  if (typeof type === 'string') {
    const match = (def.generics || []).find(param => param.name === type);
    if (match) {
      return match.extends;
    }
    return type;
  } else if (isInterfaceReference(type)) {
    return {interface: type.interface, generics: type.generics.map(subType => resolveGenerics(def, subType))};
  } else if (isUnion(type)) {
    return {union: type.union.map(subType => resolveGenerics(def, subType))};
  }
  throw new Error('Can not resolve generics for ' + JSON.stringify(type));
}

export function getEventTypeName(def: ExtendedApi, eventName: string, parameters: object) {
  if (def.events[eventName].eventObject) {
    return def.events[eventName].eventObject;
  }
  return parameters ? def.type + capitalizeFirstChar(eventName) + 'Event' : 'EventObject';
}

// tslint:disable-next-line: no-any
export function isExtendedAPI(value: any): value is ExtendedApi {
  return value instanceof Object && 'category' in value;
}

// tslint:disable-next-line: no-any
export function isUnion(value: any): value is {union: TypeReference[]} {
  return value instanceof Object && 'union' in value;
}

// tslint:disable-next-line: no-any
export function isTuple(value: any): value is {tuple: TypeReference[]} {
  return value instanceof Object && 'tuple' in value;
}

// tslint:disable-next-line: no-any
export function isMap(value: any): value is {map: Properties} {
  return value instanceof Object && 'map' in value && !('indexType' in value);
}

// tslint:disable-next-line: no-any
export function isIndexedMap(value: any):
  value is {map: {[key: string]: TypeReference}, indexType: 'string' | 'number' | 'SelectorString'}
{
  return value instanceof Object && 'map' in value && ('indexType' in value);
}

// tslint:disable-next-line: no-any
export function isCallback(value: any):
  value is {callback: NamedType[], returns: NamedType}
{
  return value instanceof Object && 'callback' in value;
}

// tslint:disable-next-line: no-any
export function isInterfaceReference(value: any): value is {interface: string, generics?: schema.Generics} {
  return value instanceof Object && typeof value.interface === 'string';
}

export function isOfType(defs: ApiDefinitions, def: ExtendedApi, type: string) {
  return def && (def.type === type || isOfType(defs, defs[plainType(def.extends)], type));
}

export function plainType(ref: TypeReference): string {
  if (ref === 'void') {
    return 'undefined';
  }
  if (typeof ref === 'string') {
    return ref;
  }
  if (isInterfaceReference(ref)) {
    return ref.interface;
  }
  if (isCallback(ref)) {
    return 'Function';
  }
  if (isMap(ref) || isIndexedMap(ref)) {
    return 'Object';
  }
  if (isTuple(ref)) {
    return 'Array';
  }
  if (isUnion(ref)) {
    return '(mixed)';
  }
  return undefined;
}

// tslint:disable-next-line: no-any
export function has<Key extends string>(value: any, property: Key, type: 'string'): value is {[key in Key]: string} {
  return value && typeof value[property] === 'string';
}
