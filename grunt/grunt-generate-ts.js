const header = `
// Type definitions for Tabris.js \${VERSION}
/// <reference path="console.d.ts" />
/// <reference path="localStorage.d.ts" />
/// <reference path="timer.d.ts" />
/// <reference path="whatwg-fetch.d.ts" />
/// <reference path="Event.d.ts" />
/// <reference path="XMLHttpRequest.d.ts" />
/// <reference path="ObjectAssign.d.ts" />

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export as namespace tabris;

`.trim();

module.exports = function(grunt) {

  grunt.registerTask('generate-tsd', () => {
    let defs = readJsonDefs();
    let tsd = createTypeDefs(defs).replace(/\${VERSION}/g, grunt.config('version'));
    grunt.file.write('build/tabris/tabris.d.ts', tsd);
  });

  function readJsonDefs() {
    let defs = {};
    let doc = grunt.config('doc');
    let files = grunt.file.expand(doc.api);
    files.forEach((file) => {
      let json = grunt.file.readJSON(file);
      json.file = file;
      defs[json.type] = json;
    });
    return defs;
  }

  function createTypeDefs(defs) {
    let result = new Text();
    result.append(header);
    result.append('');
    result.append(grunt.file.read(grunt.config('doc').typings));
    result.append('');
    Object.keys(defs).forEach((name) => {
      defs[name].isNativeObject = isNativeObject(defs, defs[name]);
      createTypeDef(result, defs[name]);
    });
    result.append('');
    return result.toString();
  }

  function isNativeObject(defs, def) {
    return def && (def.type === 'NativeObject' || isNativeObject(defs, defs[def.extends]));
  }

  function createTypeDef(result, def) {
    result.append('// ' + def.type);
    if (def.isNativeObject) {
      result.append('');
      addPropertyInterface(result, def);
    }
    result.append('');
    addClass(result, def);
    addInstance(result, def);
    result.append('');
  }

  function addInstance(result, def) {
    if (def.object) {
      result.append('');
      result.append(`declare let ${def.object}: ${def.type};`);
    }
  }

  function addClass(result, def) {
    result.append(createDoc(def));
    addClassDef(result, def);
    result.indent++;
    addConstructor(result, def);
    addMethods(result, def);
    let propertiesFilter = def.isNativeObject ? prop => prop.readonly : () => true;
    addProperties(result, def, propertiesFilter);
    if (def.isNativeObject) {
      addPropertyApi(result, def);
    }
    result.indent--;
    result.append('}');
  }

  function addConstructor(result, def) {
    result.append('');
    let str = def.isNativeObject ? `properties?: ${def.type}Properties` : '';
    result.append('constructor(' + str + ');');
  }

  function addClassDef(result, def) {
    if (def.isNativeObject) {
      result.append(`interface ${def.type} extends _${def.type}Properties {}`);
    }
    let str = 'export class ' + def.type;
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

  function addMethods(result, def) {
    if (def.methods) {
      Object.keys(def.methods).sort().forEach((name) => {
        if (!Array.isArray(def.methods[name])) {
          throw new Error('method definition not an array', def.type, name);
        }
        def.methods[name].forEach((method) => {
          result.append('');
          result.append(createMethod(name, method));
        });
      });
    }
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

  function addPropertyApi(result, def) {
    if (def.properties) {
      result.append('');
      result.append(createComment([
        'Gets the current value of the given *property*.',
        '@param property'
      ]));
      result.append('get(property: string): any;');
      result.append('');
      result.append(createComment([
        'Sets the given property. Supports chaining.',
        '@param property',
        '@param value'
      ]));
      result.append('set(property: string, value: any): this;');
      result.append('');
      result.append(createComment([
        'Sets all key-value pairs in the properties object as widget properties. Supports chaining.',
        '@param properties'
      ]));
      result.append(`set(properties: ${def.type}Properties): this;`);
    }
  }

  function createProperty(name, def) {
    let result = [];
    result.push(createDoc(def));
    let values = [];
    (def.values || []).sort().forEach((value) => {
      values.push(`"${value}"`);
    });
    let valuesType = (values || []).join(' | ');
    result.push(`${def.readonly ? 'readonly ' : ''}${name}: ${valuesType || def.type};`);
    return result.join('\n');
  }

  function createMethod(name, def) {
    let result = [];
    result.push(createDoc(def));
    result.push(`${name}(${createParamList(def.parameters)}): ${def.returns || 'void'};`);
    return result.join('\n');
  }

  function createParamList(parameters) {
    return parameters.map(param => `${param.name}${param.optional ? '?' : ''}: ${param.type}`).join(', ');
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

};

