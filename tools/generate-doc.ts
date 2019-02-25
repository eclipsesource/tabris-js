import * as fs from 'fs-extra';
import * as schema from './api-schema';
import { ApiDefinitions, asArray, ExtendedApi, getTitle, readJsonDefs } from './common';
import { join, parse, relative, sep } from 'path';

type TypeLinks = {[type: string]: string};
type NamedEvents = Array<schema.Event & {name: string}>;

const MSG_PROVISIONAL = '**Note:** this API is provisional and may change in a future release.';
const LANG_TYPE_LINKS: TypeLinks = {
  'Object': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  'object': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  'string': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
  'string[]': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
  'boolean': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type',
  'number': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
  'number[]': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
  'null': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type',
  'undefined': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type',
  'any': 'https://www.typescriptlang.org/docs/handbook/basic-types.html#any',
  'void': 'https://www.typescriptlang.org/docs/handbook/basic-types.html#void',
  'this': '#'
};

type Config = {files: string[], targetPath: string, version: string};

exports.generateDoc = function generateDoc({files, targetPath, version}: Config) {
  const generator = new DocumentationGenerator(targetPath, version, files);
  generator.generate();
};

class DocumentationGenerator {

  public readonly defs: ApiDefinitions;
  public readonly typeLinks: TypeLinks = Object.assign({}, LANG_TYPE_LINKS);

  constructor(
    public readonly targetPath: string,
    public readonly tabrisVersion: string,
    files: string[]
  ) {
    this.readPropertyTypes();
    this.defs = readJsonDefs(files);
    this.preProcessDefinitions();
  }

  public generate() {
    this.renderAPI();
    this.renderIndex();
  }

  private preProcessDefinitions() {
    Object.keys(this.defs).forEach(title => {
      if (this.defs[title].type) {
        this.addTypeLink(this.defs[title].type, `${this.defs[title].type}.md`);
      }
    });
  }

  private readPropertyTypes() {
    const typesFile = join(this.targetPath, 'types.md');
    const path = relative(join(this.targetPath, 'api'), typesFile).replace(sep, '/');
    const list = fs.readFileSync(typesFile, 'utf-8').match(/^### *(.*)$/gm).map(heading => heading.slice(4));
    for (const type of list) {
      this.addTypeLink(type, `${path}#${type.toLowerCase()}`);
    }
  }

  private renderAPI() {
    const apiPath = join(this.targetPath, 'api');
    Object.keys(this.defs).forEach(title => {
      const targetFile = join(apiPath, parse(this.defs[title].file).name + '.md');
      fs.writeFileSync(targetFile, new DocumentRenderer(this, title).render());
    });
  }

  private renderIndex() {
    const tocFile = join(this.targetPath, 'toc.yml');
    const sortedAPI = Object.keys(this.defs).map(key => this.defs[key]).sort(compareTitles);
    const render = (def) => `    - title: ${getTitle(def)}\n      url: api/${parse(def.file).name}.html`;
    const content = {
      api: sortedAPI.filter(def => !def.isWidget).map(render).join('\n'),
      widgets: sortedAPI.filter(def => def.isWidget).map(render).join('\n')
    };
    const text = fs.readFileSync(tocFile, 'utf-8').replace(/<%=\s*(\S+)\s*%>/g, (match, word) => content[word]);
    fs.writeFileSync(tocFile, text);
  }

  private addTypeLink(type: string, link: string) {
    if (this.typeLinks[type]) {
      throw new Error('Duplicate type ' + type);
    }
    this.typeLinks[type] = link;
  }

}

class DocumentRenderer {

  private readonly defs: ApiDefinitions;
  private readonly def: ExtendedApi;
  private readonly typeLinks: TypeLinks;
  private readonly targetPath: string;
  private readonly tabrisVersion: string;

  constructor(docGenerator: DocumentationGenerator, private readonly title: string) {
    this.title = title;
    this.targetPath = docGenerator.targetPath;
    this.defs = docGenerator.defs;
    this.typeLinks = docGenerator.typeLinks;
    this.tabrisVersion = docGenerator.tabrisVersion;
    this.def = this.defs[this.title];
  }

  public render() {
    let heading = this.title;
    if (this.def.namespace === 'global' && this.def.object) {
      heading = `Global object "${this.def.object}"`;
    } else if (this.def.object) {
      heading = `Object "${this.def.object}"`;
    } else if (this.def.isWidget || this.def.type) {
      heading = `Class "${this.def.type}"`;
    }
    return [
      '---\n---',
      '# ' + heading + '\n',
      this.renderExtends(),
      this.renderDescription(),
      this.renderImages(),
      this.renderSummary(),
      this.renderInfoFile(),
      this.renderLinks(),
      this.renderConstructor(),
      this.renderMembers()
    ].filter(value => !!value).join('\n');
  }

  private renderDescription() {
    return this.def.description ? this.def.description + '\n\n' : '';
  }

  private renderInfoFile() {
    const apiPath = join(this.targetPath, 'api');
    const exampleFile = join(apiPath, parse(this.def.file).name + '.md');
    if (isFileSync(exampleFile)) {
      return [
        '## Example',
        fs.readFileSync(exampleFile, 'utf-8')
      ].join('\n');
    } else {
      console.warn('No description file for ' + this.title);
    }
  }

  private renderExtends() {
    if (!this.def.type) {
      return '';
    }
    const hierarchy = [];
    let currentType = this.def.type;
    while (currentType) {
      hierarchy.unshift(this.renderTypeLink(currentType));
      if (currentType === 'Object') {
        currentType = null;
      } else if (this.defs[currentType]) {
        currentType = this.defs[currentType].extends || 'Object';
      } else {
        throw new Error('Could not find super type for ' + currentType);
      }
    }
    return hierarchy.join(' > ') + '\n';
  }

  private renderImages() {
    const androidImage = join('img/android', parse(this.def.file).name + '.png');
    const iosImage = join('img/ios', parse(this.def.file).name + '.png');
    const result = this.createImageFigure(androidImage, 'Android') + this.createImageFigure(iosImage, 'iOS');
    if (result.length !== 0) {
      return `<div class="tabris-image">${result}</div>\n`;
    }
    if (this.def.type !== 'Widget' && (this.def.isWidget || this.def.extends === 'Popup')) {
      console.warn('No image for ' + this.def.type);
    }
    return '';
  }

  private createImageFigure(image: string, platform: string): string {
    // a <figure> shows a content element together with a descriptive caption
    // the child <div> is required to scale the image inside the <figure> container
    if (isFileSync(join('doc/api', image))) {
      return `<figure><div><img srcset="${image} 2x" src="${image}" alt="${this.def.type} on ${platform}"/></div>` +
        `<figcaption>${platform}</figcaption></figure>`;
    } else {
      return '';
    }
  }

  private renderSummary() {
    const result = [];
    if (this.def.type) {
      if (this.def.generics || this.def.ts_extends) {
        result.push('TypeScript type | `', this.def.type);
        if (this.def.generics) {
          result.push('<', this.def.generics, '>');
        }
        result.push(' extends ', this.def.ts_extends || this.def.extends || 'Object', '`\n');
      }
      result.push('Constructor | *', this.def.constructor.access || 'public', '*\n');
      result.push('Singleton | ', this.def.object ? '`' + this.def.object + '`' : '*No*', '\n');
      result.push('Namespace |`', this.def.namespace || 'tabris', '`\n');
      const subclasses = Object.keys(this.defs).filter(def => this.defs[def].extends === this.def.type);
      result.push('Direct subclasses | ');
      if (subclasses.length) {
        result.push(subclasses.map(name => this.renderTypeLink(name)).join(', '), '\n');
      } else {
        result.push('*None*\n');
      }
      result.push(this.renderJSXSummary());
      result.push('\n');
    }
    return result.join('');
  }

  private renderJSXSummary() {
    const jsx = (this.def.isWidget || this.def.extends === 'Popup')
      && this.def.constructor.access === 'public';
    const result = [];
    result.push('JSX support | ');
    if (jsx) {
      const contentProps =
        Object.keys(this.def.properties || {}).filter(prop => this.def.properties[prop].jsxContentProperty);
      result.push('Element: `<', this.def.type, '/>`<br/>');
      if (this.def.isWidget) {
        const parentElement = (this.def.methods && this.def.methods.parent)
          ? this.renderJSXLink((this.def.methods.parent as schema.Method).returns)
          : this.renderJSXLink('Composite') + ' *and any widget extending* ' + this.renderTypeLink('Composite');
        result.push('Parent element: ', parentElement, '<br/>');
      }
      result.push('Child elements: ');
      const childTypes = [];
      if (this.def.type === 'Composite' || (this.def.extends === 'Composite' && !this.def.ts_extends)) {
        childTypes.push('*Widgets*');
      } else if (this.def.ts_extends && /Composite<(.+)>$/.test(this.def.ts_extends)) {
        childTypes.push('`<' + RegExp.$1 + '/>`');
      }
      contentProps.forEach(propName => {
        if (this.def.properties[propName].jsxType) {
          childTypes.push('[`<' + this.def.properties[propName].jsxType + '/>`](#' + propName + ')');
        }
      });
      if (!childTypes.length) {
        childTypes.push('*None*');
      }
      result.push(childTypes.join(', '), '<br/>');
      let textContent = null;
      contentProps.forEach(propName => {
        if (!this.def.properties[propName].jsxType) {
          textContent = '*Sets [' + propName + '](#' + propName + ') property*';
        }
      });
      result.push('Text content: ', textContent || '*Not supported*', '<br/>');
    } else {
      result.push('*No*\n');
    }
    return result.join('');
  }

  private renderMembers() {
    return [
      this.renderAllMethods(),
      this.renderAllProperties(),
      this.renderAllEvents()
    ].filter(value => !!value).join('\n');
  }

  private renderConstructor() {
    if (!this.def.constructor || this.def.constructor.access !== 'public') {
      return '';
    }
    const result = [
      '## Constructor\n\n',
      `### new ${this.def.type}${this.renderSignature(this.def.constructor.parameters)}\n\n`
    ];
    if (this.def.constructor.parameters) {
      result.push(this.renderMethodParamList(this.def.constructor.parameters, false));
      result.push('\n');
    }
    return result.join('');
  }

  private renderAllMethods() {
    const result = [];
    const publicMethodKeys = Object.keys(this.def.methods || {})
      .filter(name => isPublic(name) && isJS(this.def.methods[name])).sort();
    const protectedMethodKeys = Object.keys(this.def.methods || {})
      .filter(name => !isPublic(name) && isJS(this.def.methods[name])).sort();
    const staticMethodKeys = Object.keys((this.def.statics || {}).methods || {})
      .filter(name => isJS(this.def.statics.methods[name])).sort();
    if (publicMethodKeys.length) {
      result.push('## Methods\n\n');
      result.push(this.renderMethods(this.def.methods, publicMethodKeys));
    }
    if (protectedMethodKeys.length) {
      result.push('## Protected Methods\n\n');
      result.push(`These methods are accessible only in classes extending *${this.def.type}*.\n\n`);
      result.push(this.renderMethods(this.def.methods, protectedMethodKeys));
    }
    if (staticMethodKeys.length) {
      result.push('## Static Methods\n\n');
      result.push(this.renderMethods(this.def.statics.methods, staticMethodKeys));
    }
    return result.join('');
  }

  private renderMethods(methods: {[name: string]: schema.Method | schema.Method[]}, names: string[]) {
    const result = [];
    names.forEach(name => {
      asArray(methods[name]).forEach(desc => {
        result.push(this.renderMethod(name, desc));
      });
    });
    return result.join('');
  }

  private renderMethod(name: string, method: schema.Method) {
    const result = [];
    result.push('### ' + name + this.renderSignature(method.parameters) + '\n');
    result.push(this.renderPlatforms(method.platforms) + '\n\n');
    if (method.provisional) {
      result.push('\n', MSG_PROVISIONAL, '\n');
    }
    if (method.description) {
      result.push('\n', method.description, '\n');
    } else {
      console.warn('No description for ' + this.title + ' method ' + name);
    }
    if (method.parameters && method.parameters.length) {
      result.push('\n\n', this.renderMethodParamList(method.parameters, true), '\n\n');
    }
    result.push('\nReturns ', this.renderTypeLink(method.returns || 'void'), '\n');
    return result.join('') + '\n';
  }

  private renderAllProperties() {
    const {properties, statics, type} = this.def;
    const result = [];
    const publicPropertyKeys = Object.keys(properties || {})
      .filter(name => isPublic(name) && isJS(properties[name])).sort();
    const protectedPropertyKeys = Object.keys(properties || {})
      .filter(name => !isPublic(name) && isJS(properties[name])).sort();
    const staticPropertyKeys = Object.keys((statics || {}).properties || {})
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
    const property = properties[name];
    result.push('### ', name, '\n', this.renderPlatforms(property.platforms), '\n\n');
    if (property.description) {
      result.push(property.description + '\n');
    }
    result.push(this.renderPropertySummary(property, name), '\n\n');
    if (property.jsxContentProperty) {
      result.push(`\n\nWhen using ${this.def.type} as an JSX element `);
      result.push(property.jsxType ? 'its child elements are' : 'the element content is');
      result.push(` mapped to this property. `);
      result.push(`Therefore\n\`\`\`jsx\n<${type}>`);
      result.push(property.jsxType ? `{${name}}` : 'Hello World');
      result.push(`</${type}>\n\`\`\`\n has the same effect as:\n\`\`\`jsx\n<${type} ${name}=`);
      result.push(property.jsxType ? `{${name}}` : `'Hello World'`);
      result.push(` />${property.jsxType ? ' ' : ''}\n\`\`\`\n`);
    }
    if (property.jsxType) {
      // TODO: create items overview document to link
      result.push(`The \`${property.jsxType}\` element needs to be imported from the \`tabris\` module separately`);
      result.push(` and has the same attributes as the property type.`);
    }
    if (property.const && !isStatic) {
      result.push('\n\nThis property can only be set via constructor');
      if (this.def.isWidget || this.def.extends === 'Popup') {
        result.push(' or JSX');
      }
      result.push('. Once set, it cannot change anymore.');
    }
    result.push('\n\n');
    return result.join('');
  }

  private renderPlatforms(platforms: schema.Platforms) {
    if (!platforms) {
      return '';
    }
    const result = ['<p class="platforms">'];
    const names = {ios: 'iOS', android: 'Android'};
    for (const platform in names) {
      if (platforms[platform] !== false) {
        const name = names[platform];
        result.push(`<span class='${platform}-tag' title='supported on ${name}'>${name}</span>`);
      }
    }
    result.push('</p>');
    return result.join('');
  }

  private renderPropertySummary(property: schema.Property, name: string) {
    const result = ['\nType | '];
    if (property.values) { // TODO: remove in favor of using only union types
      result.push(property.values.map(v => literal(v, property.type)).join(' \\| '));
    } else {
      result.push(this.renderTypeLink(property.type));
    }
    result.push('\n');
    if (property.default) {
      result.push('Default | ', literal(property.default, property.type), '\n');
    }
    result.push('Settable | ');
    if (property.readonly) {
      result.push('*No*\n');
    } else if (property.const) {
      result.push('*On creation*\n');
    } else {
      result.push('*Yes*\n');
    }
    if (property.jsxContentProperty) {
      result.push('JSX content type | `', property.jsxType || property.type, '`\n');
    }
    if (!property.default && !property.readonly) {
      // TODO: how to handle non-primitives?
      console.warn('No default value for ' + this.title + ' property ' + name);
    }
    return result.join('');
  }

  private renderAllEvents() {
    const typeEvents: NamedEvents = Object.keys(this.def.events || {})
      .map(name => Object.assign({name}, this.def.events[name]));
    const changeEvents: NamedEvents = this.createChangeEvents();
    const result = [];
    if (Object.keys(typeEvents).length) {
      result.push('## Events\n\n');
      result.push(this.renderEvents(typeEvents));
    }
    if (Object.keys(changeEvents).length) {
      result.push('## Change Events\n\n');
      result.push(this.renderEvents(changeEvents));
    }
    return result.join('');
  }

  private renderEvents(events: NamedEvents) {
    return events.map(({name, description, parameters, platforms}) => [
      '### ', name, '\n\n', this.renderPlatforms(platforms),
      description ? description + '\n\n' : '\n',
      parameters ? this.renderEventParamList(parameters) : ''
    ].join('')).join('');
  }

  private createChangeEvents(): NamedEvents {
    const properties = this.def.properties;
    if (!properties || !Object.keys(properties).length) {
      return [];
    }
    return Object.keys(properties)
      .filter(name => !properties[name].const)
      .map(name => {
        const standardDescription = `Fired when the [*${name}*](#${name}) property has changed.`;
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
    // TODO: support defaults
    return '(' + (parameters || []).map(param => {
      const paramObject = typeof param === 'object' ? param : {name: param, optional: false};
      return paramObject.name + (paramObject.optional ? '?' : '');
    }).join(', ') + ')';
  }

  private renderEventParamList(parameters: {[name: string]: schema.Property}) {
    // TODO: create event objects overview article to link here instead
    return 'Parameter|Type|Description\n-|-|-\n' + Object.keys(parameters).sort().map(key => {
      const param = parameters[key];
      let type = 'any';
      if (param.type) {
        type = this.renderTypeLink(this.decodeType(param.type, true));
      } else {
        console.warn('No type for event parameter ' + key + ' in ' + this.title);
      }
      if (!param.description) {
        console.warn('No description for event parameter ' + key + ' in ' + this.title);
      }
      return [key, type, param.description || ''].join(' | ');
    }).join('\n') + '\n\n';
  }

  private renderMethodParamList(parameters: schema.Parameter[], hasContext: boolean) {
    return 'Parameter|Type|Optional|Description\n-|-|-|-\n' + parameters.map(param => {
      let type = 'any';
      if (param.type) {
        type = this.renderTypeLink(this.decodeType(param.type, hasContext));
      } else {
        console.warn('No type for parameter ' + param.name + ' in ' + this.title);
      }
      if (!param.description) {
        console.warn('No description for parameter ' + param.name + ' in ' + this.title);
      }
      return [param.name, type, param.optional ? 'Yes' : 'No', param.description || ''].join(' | ');
    }).join('\n');
  }

  private renderLinks() {
    // TODO: replace by either description text and/or examples field in members
    if (!this.def.links || !this.def.links.length) {
      return '';
    }
    return ['See also:\n'].concat(this.def.links.map(link => {
      const path = link.path.replace('${GITHUB_BRANCH}',
        'https://github.com/eclipsesource/tabris-js/tree/v' + this.tabrisVersion);
      return `- [${link.title}](${path})`;
    })).join('\n') + '\n';
  }

  private renderTypeLink(type: string): string {
    return '<span style="white-space:nowrap;">' + type.split('|')
      .map(name => name.trim())
      .map(name => {
        if (!this.typeLinks[name] && name[0] !== '\'' && name[0] !== '[' && name[0] !== '{') {
          console.warn('No type link for ' + name);
        }
        return this.typeLinks[name] ? `[\`${name}\`](${this.typeLinks[name]})` : '`' + name + '`';
      })
      .join(' \\| ') + '</span>';
  }

  private renderJSXLink(name: string) {
    return this.typeLinks[name] ? `[\`<${name}/>\`](${this.typeLinks[name]})` : '`<' + name + '/>`';
  }

  private decodeType(type: string, hasContext: boolean) {
    if (type !== 'PropertiesObject') {
      return type;
    } else if (hasContext) {
      return `Properties<${this.def.type}>`;
    }
    return `Properties<typeof ${this.def.type}>`;
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

function literal(value: string | boolean | number | {[key: string]: string}, type: string) {
  if (type === 'string') {
    return '`\'' + value + '\'`';
  }
  return '`' + value + '`';
}
