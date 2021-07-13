import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  ApiDefinitions, asArray, ExtendedApi, getTitle, readJsonDefs, hasChangeEvent, plainType, isInterfaceReference,
  isUnion, isTuple, isMap, isIndexedMap, isCallback, getEventTypeName, getJSXChildElementType, supportsJsx,
  getJSXContentType
} from './common';
import {join, parse, resolve} from 'path';

type Link = {href?: string, title?: string};
type TypeLinks = {[type: string]: Link};
type NamedEvents = Array<schema.Event & {name: string}>;
type Config = {sourcePath: string, targetPath: string, snippetsPath: string, version: string};
type Member = schema.Method | schema.Method[] | schema.Property;
type TocEntry = {title: string, url: string, priority?: boolean};

const HTML_LT = '&lt;';
const HTML_GT = '&gt;';
const HTML_QUOT = '&quot;';
const HTML_PIPE = '&#124;';
const CHANGE_EVENT_INTERFACE = 'PropertyChangedEvent';
const quot = (...str) => HTML_QUOT + str.join('') + HTML_QUOT;
const tag = (...str) => HTML_LT + str.join('') + HTML_GT;
const code = (...str) => '<code style="white-space: nowrap">' + str.join('') + '</code>';
const nbsp = (count: number) => new Array(count + 1).join('&nbsp;');
const pipeOr = (arr: string[], indent = null) => (indent !== null && arr.length > 1)
  ? nbsp(indent) + arr.join('<br/>' + nbsp(indent) + HTML_PIPE + ' ')
  : arr.join(' ' + HTML_PIPE + ' ');
const mdnTitle = type => `View ${quot(type)} on MDN`;
const MSG_PROVISIONAL = '**Note:** this API is provisional and may change in a future release.';
const LANG_TYPE_LINKS: TypeLinks = {
  Function: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
    title: mdnTitle('Function')
  },
  Object: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
    title: mdnTitle('Object')
  },
  object: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
    title: mdnTitle('Object')
  },
  string: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type',
    title: mdnTitle('string')
  },
  boolean: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type',
    title: mdnTitle('boolean')
  },
  number: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type',
    title: mdnTitle('number')
  },
  null: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#null_type',
    title: mdnTitle('null')
  },
  undefined: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#undefined_type',
    title: mdnTitle('undefined')
  },
  Promise: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    title: mdnTitle('Promise')
  },
  IterableIterator: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol',
    title: mdnTitle('IterableIterator')
  },
  Array: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    title: mdnTitle('Array')
  },
  ArrayBuffer: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer',
    title: mdnTitle('ArrayBuffer')
  },
  TypedArray: {
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays',
    title: mdnTitle('typed arrays')
  },
  Selector: {
    href: '../selector.md',
    title: 'More about selectors'
  },
  SelectorString: {
    href: '../selector.md',
    title: 'More about selectors'
  },
  any: {
    title: 'Literally any JavaScript value'
  },
  this: {
    href: '#',
    title: 'This object'
  }
};
const PLAYGROUND = 'https://playground.tabris.com/';
const GITHUB_TREE = 'https://github.com/eclipsesource/tabris-js/tree/';
const DECORATORS_TREE = 'https://github.com/eclipsesource/tabris-decorators/tree/';
const FILE_TYPES = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TypeScript/JSX',
  console: 'Interactive Console'
};
const TOC_INCLUDE: {[cat: string]: TocEntry[]} = {
  core: [],
  service: [
    {
      title: 'Worker',
      url: 'w3c-api.html#worker'
    }
  ],
  widget: [
    {
      title: 'Overview',
      url: 'api/widget-overview.html',
      priority: true
    }
  ],
  popup: [],
  net: [
    {
      title: 'XMLHttpRequest',
      url: 'w3c-api.html#xmlhttprequest'
    },
    {
      title: 'WebSocket',
      url: 'w3c-api.html#websocket'
    }
  ],
  data: []
};

exports.generateDoc = function generateDoc(options: Config) {
  const generator = new DocumentationGenerator(options);
  generator.generate();
};

class DocumentationGenerator {

  public readonly targetPath: string;
  public readonly sourcePath: string;
  public readonly apiSourcePath: string;
  public readonly apiTargetPath: string;
  public readonly defs: ApiDefinitions;
  public readonly snippets: {[name: string]: string} = {};
  public readonly typeLinks: TypeLinks = Object.assign({}, LANG_TYPE_LINKS);
  public readonly version: string;

  constructor(options: Config) {
    if (
      !options ||
      !options.snippetsPath ||
      !options.sourcePath ||
      !options.targetPath ||
      !options.version
    ) {
      throw new Error('Missing Option in ' + JSON.stringify(options));
    }
    this.version = options.version;
    this.targetPath = options.targetPath;
    this.sourcePath = options.sourcePath;
    this.apiSourcePath = join(options.sourcePath, 'api');
    this.apiTargetPath = join(options.targetPath, 'api');
    this.readSnippets(options.snippetsPath);
    this.defs = readJsonDefs(this.apiSourcePath);
    this.preProcessDefinitions();
    this.copyResources();
  }

  public generate() {
    this.renderOverview();
    this.renderAPI();
    this.renderIndex();
  }

  public renderGithubUrl(link: schema.Snippet) {
    const preRelease = this.version.indexOf('-') !== -1;
    if (link.repo === 'tabris-decorators') {
      return [
        DECORATORS_TREE,
        preRelease ? 'master' : 'v' + this.version,
        '/examples/',
        link.snippet
      ].join('');
    } else {
      return [
        GITHUB_TREE,
        preRelease ? 'master' : 'v' + this.version,
        link.snippet.endsWith('json') ? '/schema/' : '/snippets/',
        link.snippet
      ].join('');
    }
  }

  private copyResources() {
    fs.copySync(this.sourcePath, this.targetPath, {
      filter: (path) => !/[\\/]api[\\/].+\./.test(path) || /[\\/]img[\\/].+\./.test(path)
    });
    getFiles(this.targetPath)
      .filter(path => /\.md$/.test(path))
      .forEach(path => fs.writeFileSync(
        path,
        this.replaceVariables(fs.readFileSync(path).toString(), '.')
      ));
  }

  private preProcessDefinitions() {
    Object.keys(this.defs).forEach(title => {
      if (this.defs[title].type) {
        this.addTypeLink(
          this.defs[title].type,
          `${parse(this.defs[title].file).name}.md`,
          title + (this.defs[title].object ? ' Object' : ' Class') + ' Reference'
        );
      }
      for (const related in (this.defs[title].relatedTypes || {})) {
        this.addTypeLink(
          related,
          `${parse(this.defs[title].file).name}.md#${this.defs[title].relatedTypes[related]}`,
          title + (this.defs[title].object ? ' Object' : ' Class') + ' Type'
        );
      }
      Object.keys(this.defs[title].properties || {}).forEach(property => this.addSnippets(
        `${title}-${property}`,
        this.defs[title].properties[property]
      ));
      Object.keys(this.defs[title].methods || {}).forEach(method =>
        asArray(this.defs[title].methods[method]).forEach(signature => this.addSnippets(
          `${title}-${method}`,
          signature
        )
        ));
      Object.keys(this.defs[title].events || {}).forEach(event => this.addSnippets(
        `${title}-${event}`,
        this.defs[title].events[event]
      ));
      Object.keys((this.defs[title].statics || {}).properties || {}).forEach(property => this.addSnippets(
        `${title}-${property}`,
        this.defs[title].statics.properties[property]
      ));
      Object.keys((this.defs[title].statics || {}).methods || {}).forEach(method =>
        asArray(this.defs[title].statics.methods[method]).forEach(signature => this.addSnippets(
          `${title}-${method}`,
          signature
        )
        ));
      this.addSnippets(title, this.defs[title]);
      if (this.defs[title].links.length === 0) {
        console.warn('No links or snippets given for ' + title);
      }
    });
  }

  private readSnippets(path: string) {
    fs.readdirSync(path).forEach(snippet => {
      if (snippet.endsWith('.js') || snippet.endsWith('.jsx') || snippet.endsWith('.ts') || snippet.endsWith('.tsx')) {
        this.snippets[snippet] = join(path, snippet).replace(/\\/g, '/');
      }
    });
  }

  private renderOverview() {
    fs.writeFileSync(join(this.apiTargetPath, 'widget-overview.md'), new OverviewRenderer(this).render());
  }

  private renderAPI() {
    Object.keys(this.defs).forEach(title => {
      try {
        if (!this.defs[title].interface) {
          const targetFile = join(this.apiTargetPath, parse(this.defs[title].file).name + '.md');
          fs.writeFileSync(
            targetFile,
            this.replaceVariables(new DocumentRenderer(this, title).render(), './api')
          );
        }
      } catch (ex) {
        throw new Error(title + ': ' + ex.message + '\n' + ex.stack);
      }
    });
  }

  private replaceVariables(contents: string, cwd: '.' | './api'): string {
    const apiDir = cwd === '.' ? './api/' : './';
    return contents.replace(/\$\{doc:[a-zA-Z.-]+\}/g, subString => {
      const varName = subString.slice(6, -1);
      if (varName === 'moduleversion') {
        return this.version;
      }
      if (varName === 'snippetsUrl') {
        return this.renderGithubUrl({repo: 'tabris', snippet: ''}).slice(0, -1);
      }
      if (varName === 'examplesUrl') {
        return this.renderGithubUrl({repo: 'tabris-decorators', snippet: ''}).slice(0, -1);
      }
      if (this.typeLinks[varName]) {
        const href = this.typeLinks[varName].href;
        const link = href.startsWith('http') ? href : apiDir + href;
        return '[`' + varName + '`](' + link + ')';
      }
      if (varName.endsWith('Url') && this.typeLinks[varName.slice(0, -3)]) {
        const href = this.typeLinks[varName.slice(0, -3)].href;
        return href.startsWith('http') ? href : apiDir + href;
      }
      if (/^[a-z-]+.[jt]sx?$/.test(varName) || /^[a-z]+.json?$/.test(varName)) {
        return this.renderGithubUrl({repo: 'tabris', snippet: varName});
      }
      if (/^[a-z-]+$/.test(varName)) {
        return this.renderGithubUrl({repo: 'tabris-decorators', snippet: varName});
      }
      throw new Error('No replacement for ' + subString);
    });
  }

  private renderIndex() {
    const tocFile = join(this.targetPath, 'toc.yml');
    const toTocEntry = (def: ExtendedApi) => ({title: getTitle(def), url: `api/${parse(def.file).name}.html`});
    const render = ({title, url}: TocEntry) => `    - title: ${title}\n      url: ${url}`;
    const content = {};
    ['core', 'service', 'widget', 'popup', 'net', 'data'].forEach(category => {
      content[category] = Object.keys(this.defs)
        .map(key => this.defs[key])
        .filter(def => def.category === category)
        .filter(def => !def.interface)
        .map(toTocEntry)
        .concat(TOC_INCLUDE[category])
        .sort(compareTitles)
        .map(render)
        .join('\n');
    });
    const text = fs.readFileSync(tocFile, 'utf-8').replace(/<%=\s*(\S+)\s*%>/g, (_, word) => content[word]);
    fs.writeFileSync(tocFile, text);
  }

  private addTypeLink(type: string, href: string, title: string) {
    if (this.typeLinks[type]) {
      throw new Error('Duplicate type ' + type);
    }
    this.typeLinks[type] = {href, title};
  }

  private addSnippets(title: string, target: {links?: schema.Links}) {
    const links = target.links = target.links || [];
    const snippets = links
      .filter(isSnippet)
      .filter(snippet => snippet.repo !== 'tabris-decorators')
      .map(entry => {
        if (!this.snippets[entry.snippet]) {
          throw new Error(title + ' - No such snippet: '  + entry.snippet);
        }
        return entry.snippet;
      });
    Object.keys(this.snippets).forEach(snippet => {
      const autoInclude = snippet.startsWith(title.toLowerCase() + '.')
        || snippet.startsWith(title.toLowerCase() + '-');
      if (autoInclude && snippets.indexOf(snippet) === -1) {
        console.warn('Auto-add snippet ' + snippet + ' to ' + title);
        links.push({snippet});
      }
    });
  }

}

class OverviewRenderer {
  private defs: ApiDefinitions;

  constructor(docGenerator: DocumentationGenerator) {
    this.defs = docGenerator.defs;
  }

  public render() {
    return [
      '---\n---',
      '# Widget Overview\n',
      'To build a comprehensive user experience, different UI components can be combined. The following' +
      ' list shows all available widgets for Android and iOS.\n',
      this.renderWidgets()
    ].filter(value => !!value).join('\n');
  }

  private renderWidgets() {
    return Object.keys(this.defs).map((key) => {
      const def = this.defs[key];
      if (def.isWidget) {
        const images = renderImages(def);
        if (images) {
          const link = `${parse(def.file).name}.html`;
          return [
            `## [${def.type}](${link})\n`,
            `${def.description}\n`,
            `<div><a style="text-decoration: none" href="${link}">${images}</a></div>\n`
          ].filter(value => !!value).join('\n');
        }
      }
      return null;
    }).filter((entry) => entry)
      .join('\n');
  }

}

class DocumentRenderer {

  private readonly def: ExtendedApi;
  private readonly gen: DocumentationGenerator;

  constructor(docGenerator: DocumentationGenerator, private readonly title: string) {
    this.gen = docGenerator;
    this.def = this.gen.defs[this.title];
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
      renderImages(this.def),
      this.renderSummary(),
      this.renderInfoFile(),
      this.renderExamples(),
      this.renderLinks(this.def.links),
      this.renderConstructor(),
      this.renderMembers(),
      this.renderInfoFile('.post')
    ].filter(value => !!value).join('\n');
  }

  private renderDescription() {
    return this.def.description ? this.def.description + '\n\n' : '';
  }

  private renderInfoFile(postfix = '') {
    const infoFile = join(this.gen.apiSourcePath, parse(this.def.file).name + postfix + '.md');
    if (!fs.existsSync(infoFile)) {
      return '';
    }
    return fs.readFileSync(infoFile, 'utf-8') + '\n';
  }

  private renderExamples() {
    const exampleFiles = ['js', 'jsx', 'ts', 'tsx', 'console']
      .map(lang => join(this.gen.apiSourcePath, parse(this.def.file).name + '.' + lang))
      .filter(file => fs.existsSync(file));
    if (!exampleFiles.length) {
      return '';
    }
    return '## Examples\n' + exampleFiles.map(
      file => this.renderExamplesFile(file)
    ).join('\n');
  }

  private renderExamplesFile(path: string) {
    const content = fs.readFileSync(path, 'utf-8');
    const segments = content.split(/^\/\/ (.+:)\n\n/gm);
    const result: string[] = ['### ' + FILE_TYPES[fileExt(path)], ''];
    if (segments.length % 2 === 1) {
      if (segments[0].trim()) {
        segments.unshift('');
      } else {
        segments.shift();
      }
    }
    for (let i = 0; i < segments.length; i += 2) {
      result.push(
        segments[i],
        '```' + (fileExt(path) === 'console' ? '' : fileExt(path)),
        segments[i + 1].trim(),
        '```',
        ''
      );
    }
    return result.join('\n') + '\n';
  }

  private renderExtends() {
    if (!this.def.type) {
      return '';
    }
    const hierarchy = [];
    let currentType = this.def.type;
    while (currentType) {
      hierarchy.unshift(this.renderTypeRef(currentType));
      if (currentType === 'Object') {
        currentType = null;
      } else if (this.gen.defs[currentType]) {
        currentType = plainType(this.gen.defs[currentType].extends) || 'Object';
      } else {
        throw new Error('Could not find super type for ' + currentType);
      }
    }
    return hierarchy.join(' > ') + '\n';
  }

  private renderSummary() {
    const result = [];
    if (this.def.type) {
      result.push('Type: | ');
      result.push(code(
        this.def.type,
        this.def.generics ? this.renderGenericsDef(this.def.generics) : '',
        this.def.generics && this.def.generics.length > 1 ? '<br/>extends ' : ' extends ',
        this.renderTypeRef(this.def.extends || 'Object')
      ));
      result.push('\n');
      if (this.def.generics) {
        result.push(
          'Generics: | <span id="generics">',
          this.renderGenericDefSummary(), '</span>\n'
        );
      }
      result.push(
        'Constructor: | ',
        this.def.constructor.access || 'public', '\n',
        'Singleton:', ' | ',
        this.def.object ? '`' + this.def.object + '`' : 'No', '\n'
      );
      if (this.def.module) {
        result.push(
          '**Module:** |',
          this.renderHtmlLink(
            '**' + this.def.module + '**',
            {href: 'https://www.npmjs.com/package/' + this.def.module}
          ),
          '\n'
        );
      }
      if (this.def.namespace !== false) {
        result.push(
          'Namespace: |',
          this.renderHtmlLink(this.def.namespace || 'tabris', {href: '../modules.md#startup'}), '\n'
        );
      }
      const subclasses = Object.keys(this.gen.defs)
        .filter(def => plainType(this.gen.defs[def].extends) === this.def.type);
      result.push('Direct subclasses: | ');
      if (subclasses.length) {
        result.push(subclasses.map(name => code(this.renderTypeRef(name))).join(', '), '\n');
      } else {
        result.push('None\n');
      }
      result.push(this.renderJSXSummary());
      result.push('\n');
    }
    return result.join('');
  }

  private renderGenericDefSummary() {
    const result: string[] = [];
    this.def.generics.forEach(param => {
      result.push(param.name, ': ');
      if (param.description) {
        result.push('*', param.description);
        if (param.extends) {
          result.push(' Must be a subclass of ', code(this.renderTypeRef(param.extends)));
          result.push(' and defaults to ', code(this.renderTypeRef(param.default)), '.');
        } else {
          result.push(' Defaults to ', code(this.renderTypeRef(param.default)), '.');
        }
        result.push('*');
      } else {
        result.push(code(this.renderTypeRef(param.extends || param.default)));
      }
      result.push('<br/>');
    });
    return result.join('');
  }

  private renderJSXSummary() {
    const result = [];
    result.push('JSX Support: | ');
    if (supportsJsx(this.def)) {
      result.push('Element: ', code(this.renderJSXLink(this.def.type)), '<br/>');
      result.push('Parent Elements: ');
      result.push(this.renderParentElements());
      result.push('<br/>');
      result.push('Child Elements: ', this.renderChildElements(), '<br/>');
      const contentProperties = Object.keys(this.def.properties || {})
        .filter(prop => this.def.properties[prop].jsxContentProperty);
      if (contentProperties.length) {
        result.push('Element content sets: ');
        result.push(contentProperties.map(property =>
          `[${code(property)}](#${property.toLowerCase()})`
        ).join(', '));
      }
    } else {
      result.push('No\n');
    }
    return result.join('');
  }

  private renderChildElements() {
    if (!this.def.jsxChildren.length) {
      return '*Not Supported*';
    }
    if (this.def.jsxChildren[0] === 'Widget') {
      return '*Any standalone widget element*';
    }
    return this.def.jsxChildren.map(
      childType => code(this.renderJSXLink(childType))
    ).join(', ');
  }

  private resolveGenerics(type: schema.TypeReference): schema.TypeReference {
    if (!type) {
      return type;
    }
    if (typeof type === 'string') {
      const match = (this.def.generics || []).find(param => param.name === type);
      if (match) {
        return match.extends;
      }
      return type;
    } else if (isInterfaceReference(type)) {
      return {interface: type.interface, generics: type.generics.map(subType => this.resolveGenerics(subType))};
    } else if (isUnion(type)) {
      return {union: type.union.map(subType => this.resolveGenerics(subType))};
    }
    throw new Error('Can not resolve generics for ' + JSON.stringify(type));
  }

  private renderParentElements() {
    if (this.def.jsxParents && this.def.jsxParents.length) {
      // Only specific parents are allowed
      return this.def.jsxParents
        .map(type => code(this.renderJSXLink(type)))
        .join(', ');
    } else if (this.def.isWidget) {
      // Any Composite without a explicit ChildType parameter
      return Object.keys(this.gen.defs)
        .filter(key => key === 'Composite' || this.gen.defs[key].extends === 'Composite')
        .map(type => code(this.renderJSXLink(type)))
        .join(', ');
    }
    return '*Not supported*';
  }

  private renderMembers() {
    return [
      this.renderAllMethods(),
      this.renderAllProperties(),
      this.renderAllEvents()
    ].filter(value => !!value).join('\n') + '\n';
  }

  private renderConstructor() {
    if (!this.def.constructor || this.def.constructor.access !== 'public') {
      return '';
    }
    const result = [
      '## Constructor\n\n',
      `### new ${this.def.type}${this.renderSignature(this.def.constructor.parameters)}\n\n`
    ];
    if (this.def.constructor.parameters && this.def.constructor.parameters.length) {
      result.push(this.renderMethodParamList(this.def.constructor.parameters));
      result.push('\n');
    }
    return result.join('');
  }

  private renderAllMethods() {
    const result = [];
    const publicMethodKeys = Object.keys(this.def.methods || {})
      .filter(name => isPublic(this.def.methods[name]) && isJS(this.def.methods[name])).sort();
    const protectedMethodKeys = Object.keys(this.def.methods || {})
      .filter(name => isProtected(this.def.methods[name]) && isJS(this.def.methods[name])).sort();
    const staticMethodKeys = Object.keys((this.def.statics || {}).methods || {})
      .filter(
        name => isPublic(this.def.statics.methods[name]) && isJS(this.def.statics.methods[name])
      ).sort();
    if (publicMethodKeys.length) {
      result.push('## Methods\n\n');
      result.push(this.renderMethods(this.def.methods, publicMethodKeys));
    }
    if (protectedMethodKeys.length) {
      result.push('## Protected Methods\n\n');
      result.push(`These methods are accessible only in classes extending ${code(this.def.type)}.\n\n`);
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
      asArray(methods[name]).filter(sig => !sig.ts_only).forEach(desc => {
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
      console.log('No description for ' + this.title + ' method ' + name);
    }
    if (method.parameters && method.parameters.length) {
      result.push('\n\n', this.renderMethodParamList(method.parameters), '\n\n');
    }
    result.push('\nReturns: ', code(this.renderTypeRef(method.returns)), '\n');
    result.push(this.renderLinks(method.links));
    return result.join('') + '\n';
  }

  private renderAllProperties() {
    const {properties, statics, type} = this.def;
    const result = [];
    const publicPropertyKeys = Object.keys(properties || {})
      .filter(name => isPublic(properties[name]) && isJS(properties[name])).sort();
    const protectedPropertyKeys = Object.keys(properties || {})
      .filter(name => isProtected(properties[name]) && isJS(properties[name])).sort();
    const staticPropertyKeys = Object.keys((statics || {}).properties || {})
      .filter(name => isJS(statics.properties[name])).sort();
    if (publicPropertyKeys.length) {
      result.push('## Properties\n\n');
      publicPropertyKeys.forEach(name => {
        result.push(this.renderProperty(properties, name));
      });
    }
    if (protectedPropertyKeys.length) {
      result.push('## Protected Properties\n\n');
      result.push(`These properties are accessible only in classes extending ${code(type)}.\n\n`);
      protectedPropertyKeys.forEach(name => {
        result.push(this.renderProperty(properties, name));
      });
    }
    if (staticPropertyKeys.length) {
      result.push('## Static Properties\n\n');
      staticPropertyKeys.forEach(name => {
        result.push(this.renderProperty(statics.properties, name, true));
      });
    }
    return result.join('');
  }

  private renderProperty(
    properties: {[key: string]: schema.Property},
    name: string,
    isStatic: boolean = false
  ) {
    const result = [];
    const property = properties[name];
    result.push('### ', name, '\n', this.renderPlatforms(property.platforms), '\n\n');
    if (property.description) {
      result.push(property.description + '\n');
    }
    result.push(this.renderPropertySummary(property, name, isStatic), '\n\n');
    if (property.jsxContentProperty) {
      const kind = getJSXContentType(this.gen.defs, this.def, property.type);
      result.push(`\n\nWhen using ${this.def.type} as an JSX element `);
      if (kind === 'text') {
        result.push('the elements Text content is');
      } else if (kind === 'element') {
        result.push(code(this.renderJSXLink(getJSXChildElementType(this.def, property.type))));
        result.push(' child elements are');
      } else {
        result.push('the elements content value is');
      }
      result.push(' mapped to this property.');
    }
    if (property.const && !isStatic && !this.def.object && this.def.constructor.access === 'public') {
      result.push('\n\nThis property can only be set via constructor');
      if (this.def.isWidget || this.def.extends === 'Popup') {
        result.push(' or JSX');
      }
      result.push('. Once set, it cannot change anymore.\n\n');
    }
    result.push(this.renderLinks(property.links));
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

  private renderPropertySummary(property: schema.Property, name: string, isStatic: boolean) {
    const result = ['\nType: |'];
    const propertyTypeText = this.renderPropertyTypeReference(property);
    result.push(code(propertyTypeText));
    result.push('\n');
    if ('default' in property) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const def: any = property.default;
      result.push(
        'Default: | ',
        (def === '' || def === '""' || def === '\'\'')
          ? this.renderTypeLink('(empty string)', 'string')
          : code(this.literal(property.default, property.type)),
        '\n'
      );
    }
    result.push('Settable: | ');
    if (this.def.isNativeObject) {
      result.push(
        this.renderHtmlLink(
          property.readonly ? 'No'
            : property.const ? 'By Constructor or JSX'
              : 'Yes',
          {href: '../widget-basics.html#widget-properties'}
        )
      );
    } else {
      result.push(property.readonly ? 'No' : 'Yes');
    }
    if (this.def.isNativeObject) {
      result.push('\nChange Event: | ');
      if (hasChangeEvent(property, isStatic)) {
        result.push(`[\`${name}Changed\`](#${name.toLocaleLowerCase()}changed)`);
      } else {
        result.push('Not supported');
      }
    }
    if (property.jsxContentProperty) {
      const kind = getJSXContentType(this.gen.defs, this.def, property.type);
      result.push('\nJSX Content Type: | ');
      if (kind === 'text') {
        result.push('[Text](../declarative-ui.md#jsx-specifics)\n');
      } else if (kind === 'element') {
        result.push(code(this.renderJSXLink(getJSXChildElementType(this.def, property.type))), '\n');
      } else {
        result.push(code(propertyTypeText));
      }
    }
    result.push('\n');
    if (!property.default && !property.readonly) {
      // TODO: how to handle non-primitives?
      console.log('No default value for ' + this.title + ' property ' + name);
    }
    return result.join('');
  }

  private renderPropertyTypeReference(property: schema.Property): string {
    if (property.values) { // TODO: remove in favor of using only union types
      return pipeOr(property.values.map(v => this.literal(v, property.type)));
    }
    return this.renderTypeRef(property.type, false);
  }

  private renderAllEvents() {
    this.generateChangeEvents();
    const typeEvents: NamedEvents = Object.keys(this.def.events || {})
      .filter(name => !this.isChangeEvent(name))
      .map(name => Object.assign({name}, this.def.events[name]));
    const changeEvents: NamedEvents = Object.keys(this.def.events || {})
      .filter(name => this.isChangeEvent(name))
      .map(name => Object.assign({name}, this.def.events[name]));
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
    return events.map(({name, description, parameters, platforms, links}) => [
      '### ', name, '\n\n', this.renderPlatforms(platforms),
      description ? description + '\n\n' : '\n',
      'EventObject Type: ',
      this.renderEventInterface(name, parameters),
      '\n\n',
      parameters ? this.renderEventParamList(parameters) : 'This event has no additional parameter.\n',
      this.renderLinks(links)
    ].join('')).join('');
  }

  private isChangeEvent(name: string) {
    return this.def.events[name].eventObject === CHANGE_EVENT_INTERFACE;
  }

  private generateChangeEvents() {
    if (!this.def.isNativeObject) {
      return;
    }
    const properties = this.def.properties;
    if (!properties || !Object.keys(properties).length) {
      return;
    }
    if (!this.def.events) {
      this.def.events = {};
    }
    Object.keys(properties)
      .filter(name => hasChangeEvent(properties[name]))
      .forEach(name => {
        const standardDescription = `Fired when the [${name}](#${name.toLowerCase()}) property has changed.`;
        this.def.events[`${name}Changed`] = {
          description: properties[name].changeEventDescription || standardDescription,
          eventObject: CHANGE_EVENT_INTERFACE,
          parameters: {
            value: {
              type: properties[name].type,
              description: `The new value of [${name}](#${name.toLowerCase()}).`
            }
          }
        };
      });
  }

  private renderSignature(parameters: schema.Parameter[]) {
    return '(' + (parameters || []).map(param => {
      const paramObject = typeof param === 'object' ? param : {name: param, optional: false};
      return paramObject.name + (paramObject.optional ? '?' : '');
    }).join(', ') + ')';
  }

  private renderEventParamList(parameters: {[name: string]: schema.Property}) {
    return 'Property|Type|Description\n-|-|-\n' + Object.keys(parameters).sort().map(key => {
      const param = parameters[key];
      let type = 'any';
      if (param.type) {
        type = this.renderTypeRef(param.type, false);
      } else {
        console.log('No type for event parameter ' + key + ' in ' + this.title);
      }
      if (!param.description) {
        console.log('No description for event parameter ' + key + ' in ' + this.title);
      }
      return [key, code(type), param.description || ''].join(' | ');
    }).join('\n') + '\n\n';
  }

  private renderEventInterface(name: string, parameters: {[k: string]: schema.Property}): string {
    const typeName = getEventTypeName(this.def, name, parameters);
    const changeEvent = typeName === CHANGE_EVENT_INTERFACE;
    const type = this.renderTypeRef(typeName);
    const target = this.renderTypeRef(this.def.type);
    if (changeEvent) {
      return code(
        type,
        tag(
          target,
          ', ',
          this.renderTypeRef(parameters.value.type, true, true)
        )
      );
    }
    return code(type, tag(target));
  }

  private renderMethodParamList(parameters: schema.Parameter[]) {
    return 'Parameter|Type|Description\n-|-|-\n'
      + this.flattenParamList(parameters).map(param => {
        let type = 'any';
        if (param.type) {
          type = this.renderTypeRef(param.type, false);
        } else {
          console.log('No type for parameter ' + param.name + ' in ' + this.title);
        }
        const desc: string[] = [];
        if (param.description) {
          desc.push(param.description);
        }
        if (param.optional) {
          desc.push('*Optional.*');
        }
        return [param.name, code(type), desc.join(' ')].join(' | ');
      }).join('\n');
  }

  private flattenParamList(parameters: schema.Parameter[]) {
    const result: schema.Parameter[] = [];
    parameters.forEach(param => {
      if (this.gen.defs[plainType(param.type)] && this.gen.defs[plainType(param.type)].interface) {
        const paramObject = this.gen.defs[plainType(param.type)];
        result.push(Object.assign({}, param, {type: 'object'}));
        Object.keys(paramObject.properties).sort().forEach(name => {
          result.push({
            name: param.name + '.' + name,
            ...paramObject.properties[name]
          });
        });
      } else {
        result.push(param);
      }
    });
    return result;
  }

  private renderLinks(links: schema.Links) {
    if (!links || !links.length) {
      return '';
    }
    return ['\nSee also:\n'].concat(links.map(link => {
      if (isSnippet(link)) {
        const title = `${(link.title || link.snippet)}`;
        if (link.repo === 'tabris-decorators') {
          const language = link.snippet.endsWith('jsx')
            ? '<span class=\'language jsx\'>JSX</span>'
            : link.snippet.endsWith('js')
              ? '<span class=\'language js\'>JS</span>'
              : '<span class=\'language tsx\'>TSX</span>';
          return `[${language} ${title}](${this.gen.renderGithubUrl(link)})`;
        } else {
          const playgroundUrl = this.renderPlaygroundUrl(link);
          const gitHubUrl = this.gen.renderGithubUrl(link);
          const snippetType = link.snippet.split('.').pop().toLowerCase();
          const language = `<span class='language ${snippetType}'>${snippetType.toUpperCase()}</span>`;
          const playgroundHtml = [
            '<span style="font-size: 75%;">',
            `[<a href="${playgroundUrl}" style="color: cadetblue;">`,
            '► Run in Playground</a>]',
            '</span>'
          ].join('');
          return `[${language} ${title}](${gitHubUrl}) ${playgroundHtml}`;
        }
      }
      return `[${link.title}](${link.path})`;
    })).join('  \n') + '\n';
  }

  private renderPlaygroundUrl(link: schema.Snippet) {
    const preRelease = this.gen.version.indexOf('-') !== -1;
    const ref = preRelease ? 'master' : 'v' + this.gen.version;
    return `${PLAYGROUND}?gitref=${encodeURIComponent(ref)}&snippet=${encodeURIComponent(link.snippet)}`;
  }

  private renderTypeRef(ref: schema.TypeReference, flat: boolean = true, simplified: boolean = false): string {
    if (!ref) {
      return this.renderTypeLink('undefined');
    }
    if (typeof ref === 'string') {
      return this.renderTypeLink(ref === 'void' ? 'undefined' : ref);
    }
    if (isInterfaceReference(ref)) {
      if (simplified && ref.interface === 'Array') {
        return this.renderTypeRef('Array', true, simplified);
      }
      if (ref.interface === 'Array' && ref.generics.every(type => typeof type === 'string')) {
        return this.renderTypeRef(ref.generics[0]) + '[]';
      }
      if (simplified) {
        return this.renderTypeRef(ref.interface, true, simplified);
      }
      return this.renderTypeRef(ref.interface)
        + '&lt;' + ref.generics.map(type => this.renderTypeRef(type)).join(', ') + '&gt;';
    }
    if (isUnion(ref)) {
      if (simplified && ref.union.every(type => type === 'string')) {
        return this.renderTypeRef('string');
      }
      return pipeOr(
        ref.union.map(part => this.renderTypeRef(part, true, simplified)),
        ref.union.length > 2 ? 0 : null
      );
    }
    if (isTuple(ref)) {
      return '['
        + ref.tuple.map(part => this.renderTypeRef(part, true, simplified)).join(', ')
        + ']';
    }
    if (isMap(ref)) {
      if (simplified) {
        return this.renderTypeRef('Object');
      }
      const {map} = ref;
      const keys = Object.keys(map);
      const comments = keys.map(key => this.renderPropertyAsComment(map[key]));
      const hasComments = comments.some(comment => !!comment);
      if (flat || (keys.length <= 2 && !hasComments)) {
        if (hasComments) {
          console.log('Flat map entries for ' + JSON.stringify(ref) + ' will omit some type information');
        }
        const content = keys.map(key =>
          `${key}: ${this.renderTypeRef(map[key].ts_type || map[key].type)}`
        ).join(', ');
        return '{' + content + '}';
      }
      const text = ['{<br/>'];
      keys.forEach((key, index) => {
        const type = map[key].type;
        if (isUnion(type)) {
          text.push(`${nbsp(2)}${key}:${comments[index]}<br/>`);
          text.push(pipeOr(
            type.union.map(part => this.renderTypeRef(part, true, simplified)),
            type.union.length > 2 ? 4 : null
          ));
          text.push(index !== keys.length - 1 ? ',' : '');
        } else {
          text.push(`${nbsp(2)}${key}: ${this.renderTypeRef(type)}`);
          text.push(index !== keys.length - 1 ? ',' : '');
          text.push(comments[index]);
        }
        text.push('<br/>');
      });
      text.push('}');
      return text.join('');
    }
    if (isIndexedMap(ref)) {
      if (simplified) {
        return this.renderTypeRef('Object');
      }
      const name = Object.keys(ref.map)[0];
      return `{[${name}]: ${this.renderTypeRef(ref.map[name])}}`;
    }
    if (isCallback(ref)) {
      if (simplified) {
        return this.renderTypeRef('Function');
      }
      const parameters = ref.callback.map(arg => this.renderNamedType(arg)).join(', ');
      return `(${parameters}) => ${this.renderNamedType(ref.returns)}`;
    }
    throw new Error(this.def.type + ' - Can not render: ' + JSON.stringify(ref));
  }

  private renderNamedType({type, name}: {type?: schema.TypeReference, name?: string}) {
    return typeof type === 'string'
      ? this.renderTypeLink(name || type, type)
      : this.renderTypeRef(type);
  }

  private renderPropertyAsComment(property: schema.Property) {
    if (!property.default && !property.description && !property.optional) {
      return '';
    }
    const comment: string[] = [];
    if (property.description) {
      const desc = property.description;
      comment.push(desc.endsWith('.') ? desc.slice(0, -1) : desc);
    }
    if (property.optional && !property.default) {
      comment.push('optional');
    }
    if (property.default) {
      comment.push('defaults to ' + property.default);
    }
    return ' // ' + comment.join('. ' + '');
  }

  /**
   * @param content the link text
   * @param type the type to link. If omitted the link text is used as the type
   */
  private renderTypeLink(content: string, type?: schema.TypeReference): string {
    if (!content) {
      throw new Error('Missing content in typeLink ' + this.def);
    }
    const typeName = (type && plainType(type) ? plainType(type) : content)
      .replace(/"/, '\'')
      .replace(/"$/, '\'');
    const link = this.getTypeLink(typeName);
    if (typeName === '(mixed)') {
      throw new Error(content + '/' + JSON.stringify(type) + ' in ' + this.def.type + ' is mixed');
    }
    if (!link) {
      console.log('No type link for ' + typeName);
      return content;
    }
    return this.renderHtmlLink(content, link);
  }

  private getTypeLink(type: string): Link {
    if (type === this.def.type) {
      return {href: '#'};
    }
    if ((this.def.generics || []).some(param => param.name === type)) {
      return {href: '#generics', title: 'Generic Parameter' + quot(type)};
    }
    return this.gen.typeLinks[type[0] === '\'' ? 'string' : type];
  }

  private renderJSXLink(type: schema.TypeReference) {
    const name = plainType(type);
    const element = tag(name + '/');
    if (!this.getTypeLink(name)) {
      throw new Error('No type link for ' + name);
    }
    return this.renderHtmlLink(element, this.getTypeLink(name));
  }

  private renderGenericsDef(generics: schema.GenericsDef) {
    return tag(generics.map(({name}) => name).join(', '));
  }

  private renderHtmlLink(content: string, link: Link) {
    const result = ['<a '];
    if (link.href) {
      result.push('href="', link.href.replace('.md', '.html'), '" ');
    }
    if (link.title) {
      result.push('title="', link.title, '"');
    }
    result.push('>', content, '</a>');
    return result.join('');
  }

  private literal(value: string | boolean | number | {[key: string]: string}, type: schema.TypeReference) {
    if (type === 'string') {
      return this.renderTypeLink('\'' + value + '\'', 'string');
    }
    return this.renderTypeLink(value + '', typeof value);
  }

}

function compareTitles(entry1: TocEntry, entry2: TocEntry) {
  if (entry1.priority) {
    return -1;
  }
  if (entry2.priority) {
    return 1;
  }
  const title1 = entry1.title;
  const title2 = entry2.title;
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

function isJS(member: Member) {
  return asArray(member).some(variant => !variant.ts_only);
}

function isPublic(def: Member) {
  return asArray(def).some(member => !member.protected && !member.private);
}

function isProtected(def: Member) {
  return asArray(def).some(member => member.protected);
}

function renderImages(def: ExtendedApi) {
  const androidImage = join('img/android', parse(def.file).name + '.png').replace(/\\/g, '/');
  const iosImage = join('img/ios', parse(def.file).name + '.png').replace(/\\/g, '/');
  const result = createImageFigure(def, androidImage, 'Android') + createImageFigure(def, iosImage, 'iOS');
  if (result.length !== 0) {
    return `<div class="tabris-image">${result}</div>\n`;
  }
  if (def.type !== 'Widget' && (def.isWidget || def.extends === 'Popup')) {
    console.log('No image for ' + def.type);
  }
  return '';
}

function createImageFigure(def: ExtendedApi, image: string, platform: string): string {
  // a <figure> shows a content element together with a descriptive caption
  // the child <div> is required to scale the image inside the <figure> container
  if (isFileSync(join('doc/api', image))) {
    return `<figure><div><img srcset="${image} 2x" src="${image}" alt="${def.type} on ${platform}"/></div>` +
      `<figcaption>${platform}</figcaption></figure>`;
  } else {
    return '';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSnippet(obj: any): obj is schema.Snippet {
  return typeof obj.snippet === 'string';
}

function fileExt(path: string) {
  return path.split('.').pop();
}

// Source: https://stackoverflow.com/a/45130990
function getFiles(dir): string[] {
  const dirents = fs.readdirSync(dir, {withFileTypes: true});
  const files = dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}
