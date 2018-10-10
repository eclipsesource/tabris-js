import {join, parse, relative, sep} from 'path';
import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {asArray, ApiDefinitions, ExtendedApi, readJsonDefs,  getTitle, Properties, lowercaseFirstChar} from './common';
import { SchemaSchema } from 'json-schema-to-typescript/dist/src/types/JSONSchema';

type TypeLinks = {[type: string]: string};
type NamedEvents = Array<schema.Event & {name: string}>;

const SNIPPETS_LOCATION = 'snippets';
const MSG_PROVISIONAL = '**Note:** this API is provisional and may change in a future release.';

exports.generateDoc = function generateDoc({files, targetPath, version}) {
  const generator = new DocGenerator(files, targetPath, version);
  generator.generate();
};

class DocGenerator {

  private defs: ApiDefinitions;
  private typeLinks: TypeLinks = {};

  constructor(
    private readonly files: string[],
    private readonly targetPath: string,
    private readonly version: string
  ) {
    this.readPropertyTypes();
    this.readAPI();
  }

  public generate() {
    this.renderAPI();
    this.renderIndex();
  }

  private readAPI() {
    this.defs = readJsonDefs(this.files);
    Object.keys(this.defs).forEach(title => {
      if (this.defs[title].type) {
        this.addTypeLink(this.defs[title].type, `${this.defs[title].type}.md`);
      }
    });
  }

  private readPropertyTypes() {
    const typesFile = join(this.targetPath, 'types.md');
    const path = relative(join(this.targetPath, 'api'), typesFile).replace(sep, '/');
    const list = fs.readFileSync(typesFile, 'utf-8').match(/^## *(.*)$/gm).map(heading => heading.slice(3));
    for (let type of list) {
      this.addTypeLink(type, `${path}#${type.toLowerCase()}`);
    }
  }

  private renderAPI() {
    let apiPath = join(this.targetPath, 'api');
    Object.keys(this.defs).forEach(title => {
      let targetFile = join(apiPath, parse(this.defs[title].file).name + '.md');
      fs.writeFileSync(targetFile, this.renderDocument(title));
    });
  }

  private renderIndex() {
    let tocFile = join(this.targetPath, 'toc.yml');
    let sortedAPI = Object.keys(this.defs).map(key => this.defs[key]).sort(compareTitles);
    let render = (def: ExtendedApi) => `    - title: ${getTitle(def)}\n      url: api/${parse(def.file).name}.html`;
    let content = {
      api: sortedAPI.filter(def => !def.isWidget).map(render).join('\n'),
      widgets: sortedAPI.filter(def => def.isWidget).map(render).join('\n')
    };
    let text = fs.readFileSync(tocFile, 'utf-8').replace(/<%=\s*(\S+)\s*%>/g, (match, word) => content[word]);
    fs.writeFileSync(tocFile, text);
  }

  private renderDocument(title: string) {
    const def = this.defs[title];
    let heading = title;
    if (def.namespace === 'global' && def.object) {
      heading = `Global object "${def.object}"`;
    } else if (def.object) {
      heading = `Object "${def.object}"`;
    } else if (def.isWidget) {
      heading = `Widget "${def.type}"`;
    } else if (def.type) {
      heading = `Type "${def.type}"`;
    }
    return [
      '---\n---',
      '# ' + heading + '\n',
      this.renderExtends(def),
      this.renderDescription(def),
      this.renderImages(def),
      this.renderExample(def),
      this.renderMembers(def),
      this.renderSnippet(title),
      this.renderLinks(def)
    ].filter(value => !!value).join('\n');
  }

  private renderMembers(def: ExtendedApi) {
    return [
      this.renderAllMethods(def),
      this.renderAllProperties(def),
      this.renderEvents(def)
    ].filter(value => !!value).join('\n');
  }

  private renderExample(def: ExtendedApi) {
    let apiPath = join(this.targetPath, 'api');
    let exampleFile = join(apiPath, parse(def.file).name + '.md');
    if (isFileSync(exampleFile)) {
      return fs.readFileSync(exampleFile, 'utf-8');
    }
  }

  private renderSnippet(title: string) {
    let snippetPath = join(SNIPPETS_LOCATION, `${title.toLowerCase()}.js`);
    if (isFileSync(snippetPath)) {
      return [
        '## Example',
        '```js',
        fs.readFileSync(snippetPath, 'utf-8').trim(),
        '```'
      ].join('\n');
    }
  }

  private renderImages(def: ExtendedApi) {
    let androidImage = join('img/android', parse(def.file).name + '.png');
    let iosImage = join('img/ios', parse(def.file).name + '.png');
    let exists = image => isFileSync(join('doc/api', image));
    if (exists(androidImage) && exists(iosImage)) {
      return [
        'Android | iOS',
        '--- | ---',
        `![${def.type} on Android](${androidImage}) | ![${def.type} on iOS](${iosImage})`,
      ].join('\n') + '\n';
    }
    if (exists(androidImage)) {
      return `![${def.type} on Android](${androidImage})\n`;
    }
    if (exists(iosImage)) {
      return `![${def.type} on iOS](${iosImage})\n`;
    }
    return '';
  }

  private renderDescription(def: ExtendedApi) {
    let result = def.description ? def.description + '\n\n' : '';
    if (def.namespace === 'global') {
      result += `This ${def.object ? 'object' : 'API'} can be used anywhere without importing it.`;
    } else {
      result += `You can import this ${def.object ? 'object' : 'type'} like this:\n`;
      result += this.renderCodeBlock(`import {${def.object || def.type}} from 'tabris';`);
      result += `Or reference it directly form anywhere as "\`tabris.${def.object || def.type}\`".`;
    }
    return result;
  }

  private renderCodeBlock(content: string) {
    return '```js\n' + content + '\n```\n';
  }

  private renderExtends(def: ExtendedApi) {
    if (def.extends) {
      if (!(def.extends in this.defs)) {
        throw new Error('Could not find super type for ' + def.type);
      }
      let sup = this.defs[def.extends];
      return `Extends [${sup.type}](${sup.type}.md)\n`;
    }
    return '';
  }

  private renderAllMethods({type, methods, statics}: ExtendedApi) {
    let result = [];
    let publicMethodKeys = Object.keys(methods || {})
      .filter(name => isPublic(name) && isJS(methods[name])).sort();
    let protectedMethodKeys = Object.keys(methods || {})
      .filter(name => !isPublic(name) && isJS(methods[name])).sort();
    let staticMethodKeys = Object.keys((statics || {}).methods || {})
      .filter(name => isJS(statics.methods[name])).sort();
    if (publicMethodKeys.length) {
      result.push('## Methods\n\n');
      result.push(this.renderMethods(methods, publicMethodKeys));
    }
    if (protectedMethodKeys.length) {
      result.push('## Protected Methods\n\n');
      result.push(`These methods are accessible only in classes extending *${type}*.\n\n`);
      result.push(this.renderMethods(methods, protectedMethodKeys));
    }
    if (staticMethodKeys.length) {
      result.push('## Static Methods\n\n');
      result.push(`These methods are called directly on the *${type}* class, not its instance.\n\n`);
      result.push(this.renderMethods(statics.methods, staticMethodKeys));
    }
    return result.join('');
  }

  private renderMethods(methods: {[name: string]: schema.Method|schema.Method[]}, names: string[]) {
    const result = [];
    names.forEach(name => {
      asArray(methods[name]).forEach(desc => {
        result.push(this.renderMethod(name, desc));
      });
    });
    return result.join('');
  }

  private renderMethod(name: string, method: schema.Method) {
    let result = [];
    result.push('### ' + name + this.renderSignature(method.parameters)) + '\n';
    result.push(this.renderPlatforms(method.platforms) + '\n');
    if (method.parameters && method.parameters.length) {
      result.push('**Parameters:** ' + this.renderMethodParamList(method.parameters) + '\n');
    }
    if (method.returns) {
      result.push('**Returns:** *' + this.renderTypeLink(method.returns) + '*\n');
    }
    if (method.provisional) {
      result.push(MSG_PROVISIONAL + '\n');
    }
    if (method.description) {
      result.push(method.description + '\n');
    }
    return result.join('\n') + '\n';
  }

  private renderAllProperties({properties, statics, type}: ExtendedApi) {
    let result = [];
    let publicPropertyKeys = Object.keys(properties || {})
      .filter(name => isPublic(name) && isJS(properties[name])).sort();
    let protectedPropertyKeys = Object.keys(properties || {})
      .filter(name => !isPublic(name) && isJS(properties[name])).sort();
    let staticPropertyKeys = Object.keys((statics || {}).properties || {})
      .filter(name => isJS(statics.properties[name])).sort();
    if (publicPropertyKeys.length) {
      result.push('## Properties\n\n');
      publicPropertyKeys.forEach(name => {
        result.push(this.renderProperty(properties, name, type));
      });
    }
    if (protectedPropertyKeys.length) {
      result.push('## Protected Properties\n\n');
      result.push(`These properties are accessible only in classes extending *${type}*.\n\n`);
      protectedPropertyKeys.forEach(name => {
        result.push(this.renderProperty(properties, name, type));
      });
    }
    if (staticPropertyKeys.length) {
      result.push('## Static Properties\n\n');
      result.push(`These properties are accessible directly on the *${type}* class, not its instance.\n\n`);
      staticPropertyKeys.forEach(name => {
        result.push(this.renderProperty(statics.properties, name, type, true));
      });
    }
    return result.join('');
  }

  private renderProperty(
    properties: {[key: string]: schema.Property},
    name: string, type: string,
    isStatic: boolean = false
  ) {
    const result = [];
    let property = properties[name];
    result.push('### ', name, '\n', this.renderPlatforms(property.platforms), '\n\n');
    if (property.readonly) {
      result.push('**read-only**\n\n');
    }
    result.push('Type: ', this.renderPropertyType(property), '\n');
    if (property.description) {
      result.push('\n' + property.description);
    }
    if (property.jsxContentProperty) {
      const isString = property.type === 'string';
      result.push(`\n\nIn JSX the `);
      result.push(isString ? `text content ` : `child elements `);
      result.push(`of the *${type}* element `);
      result.push(isString ? `is ` : `are `);
      result.push(`mapped to this property. `);
      result.push(`Therefore \`<${type}>`);
      result.push(isString ? 'Hello World' : `{${name}}`);
      result.push(`</${type}>\` would be the same as \`<${type} ${name}=`);
      result.push(isString ? `'Hello World'` : `{${name}}`);
      result.push(` />\`.${property.jsxType ? ' ' : ''}`);
    }
    if (property.jsxType) {
      result.push(`You can also import \`${property.jsxType}\` from the \`tabris\` module and use it as an JSX element to represent ${name}.`);
    }
    if (property.const && !isStatic) {
      result.push('\n\nThis property can only be set on widget creation. Once set, it cannot change anymore.');
    }
    result.push('\n\n');
    return result.join('');
  }

  private renderPlatforms(platforms: schema.Platforms) {
    if (!platforms) {
      return '';
    }
    let result = ['<p class="platforms">'];
    let names = {ios: 'iOS', android: 'Android'};
    for (let platform in names) {
      if (platforms[platform] !== false) {
        let name = names[platform];
        result.push(` < span class = '${platform}-tag' title = 'supported on ${name}' > ${name} < /span>`);
      }
    }
    result.push('</p>');
    return result.join('');
  }

  private renderPropertyType(property: schema.Property) {
    let name = property.type;
    let result = ['*', this.renderTypeLink(name), '*'];
    if (property.values) {
      result.push(', supported values: `' + property.values.join('`, `') + '`');
    }
    if (property.default) {
      result.push(', default: `' + property.default + '`');
    }
    return result.join('');
  }

  private renderEvents(def: ExtendedApi) {
    if (!def.isNativeObject) {
      return '';
    }
    let widgetEvents: NamedEvents = Object.keys(def.events || {}).map(name => Object.assign({name}, def.events[name]));
    let changeEvents: NamedEvents = this.createChangeEvents(def.properties);
    let events = widgetEvents.concat(changeEvents).sort((a, b) => a.name.localeCompare(b.name));
    if (!events || !Object.keys(events).length) {
      return '';
    }
    return [
      '## Events\n\n',
      ...events.map(({name, description, parameters, platforms}) => ([
        '### ', name, '\n', this.renderPlatforms(platforms), '\n',
        description ? description + '\n' : '',
        parameters ? '\n#### Event Parameters ' + this.renderEventParamList(parameters) + '\n' : ''
      ]).join('')),
      '\n\n'
    ].join('');
  }

  private createChangeEvents(properties: Properties): NamedEvents {
    if (!properties || !Object.keys(properties).length) {
      return [];
    }
    return Object.keys(properties)
      .filter(name => !properties[name].const)
      .map(name => {
        let standardDescription = `Fired when the [*${name}*](#${name}) property has changed.`;
        return {
          name: `${name}Changed`,
          description: properties[name].changeEventDescription || standardDescription,
          parameters: {
            value: {
              name: 'value',
              type: properties[name].type,
              description: `The new value of [*${name}*](#${name}).`
            }
          }
        };
      });
  }

  private renderSignature(parameters: schema.Parameter[]) {
    return '(' + (parameters || []).map(param => typeof param === 'object' ? param.name : param).join(', ') + ')';
  }

  private renderEventParamList(parameters: {[name: string]: schema.Property}) {
    let result = '\n';
    result += this.renderEventParameter({name: 'target', type: 'this', description: 'The widget the event was fired on.'});
    Object.keys(parameters).sort().forEach((name) => {
      result += this.renderEventParameter(Object.assign({name}, parameters[name]));
    });
    return result;
  }

  private renderMethodParamList(parameters: schema.Parameter[]) {
    return '\n\n' + parameters.map(param => {
      let type = '';
      if (param.type) {
        type = '*' + this.renderTypeLink(param.type) + '*';
      }
      let optional = param.optional ? ' [**Optional**]' : '';
      let result = [`- ${param.name}: ${type}${optional}`];
      if (param.description) {
        result.push(`  - ${lowercaseFirstChar(param.description)}`);
      }
      return result.join('\n');
    }).join('\n');
  }

  private renderEventParameter({name, type, description}: schema.Parameter) {
    return `- **${name}**: *${this.renderTypeLink(type)}*\n    ${description}\n\n`;
  }

  private addTypeLink(type, link) {
    if (this.typeLinks[type]) {
      throw new Error('Duplicate type ' + type);
    }
    this.typeLinks[type] = link;
  }

  private renderLinks(def: ExtendedApi) {
    if (!def.links || !def.links.length) {
      return '';
    }
    return ['## See also\n'].concat(def.links.map(link => {
      let path = link.path.replace('${GITHUB_BRANCH}',
        'https://github.com/eclipsesource/tabris-js/tree/v' + this.version);
      return `- [${link.title}](${path})`;
    })).join('\n') + '\n';
  }

  private renderTypeLink(name: string) {
    return name.split('|')
      .map(name => this.typeLinks[name] ? `[${name}](${this.typeLinks[name]})` : name)
      .join('\\|');
  }

}

function compareTitles(def1: ExtendedApi, def2: ExtendedApi) {
  const title1 = getTitle(def1);
  const title2 = getTitle(def2);
  if (isLowerCase(title1) !== isLowerCase(title2)) {
    return isLowerCase(title1) ? -1 : 1;
  }
  return title1.localeCompare(title2, 'en');
}

function isLowerCase(str: string): boolean {
  return str.charAt(0).toLowerCase() === str.charAt(0);
}

function isFileSync(fpath: string): boolean {
  try {
    return fs.statSync(fpath).isFile();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

type Member = schema.Method | schema.Method[] | schema.Property;

function isJS(member: Member) {
  return asArray(member).some(variant => !variant.ts_only);
}

function isPublic(name: string) {
  return name[0] !== '_';
}
