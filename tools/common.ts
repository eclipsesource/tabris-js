import * as fs from 'fs-extra';
import * as schema from './api-schema';

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
export type ExtendedApi
  = schema.Api & Partial<{isNativeObject: boolean, parent: ExtendedApi, file: string, isWidget: boolean}>;
export type ApiDefinitions = {[name: string]: ExtendedApi};
export type Methods = schema.Method | schema.Method[];
export type Properties = {[name: string]: schema.Property};

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
      const lines = typeof arg === 'string' ? arg.split('\n') : arg;
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

export function readJsonDefs(files: string[]) {
  const defs = {};
  files.forEach(file => {
    const def = fs.readJsonSync(file);
    def.file = file;
    const title = getTitle(def);
    if (defs[title]) {
      throw new Error('Duplicate entry ' + title);
    }
    defs[title] = def;
  });
  extendTypeDefs(defs);
  return defs as ApiDefinitions;
}

export function getTitle(def: ExtendedApi): string {
  return def.type || def.object || def.title;
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
    defs[name].isNativeObject = isType(defs, defs[name], 'NativeObject');
    defs[name].isWidget = isType(defs, defs[name], 'Widget');
    if (defs[name].extends) {
      defs[name].parent = defs[defs[name].extends];
    }
  });
}

export function getEventTypeName(def: ExtendedApi, eventName: string, parameters: object) {
  if (def.events[eventName].eventObject) {
    return def.events[eventName].eventObject;
  }
  return parameters ? def.type + capitalizeFirstChar(eventName) + 'Event' : 'EventObject';
}

function isType(defs: ApiDefinitions, def: ExtendedApi, type: string) {
  return def && (def.type === type || isType(defs, defs[(def.extends || '').split('<')[0]], type));
}
