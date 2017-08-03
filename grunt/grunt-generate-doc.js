const {join, parse, relative, sep} = require('path');
const {readFileSync, readJsonSync, statSync, writeFileSync} = require('fs-extra');

const SNIPPETS_LOCATION = 'snippets';

const MSG_DEPRECATED = '**Deprecated**';
const MSG_PROVISIONAL = '**Note:** this API is provisional and may change in a future release.';
const MSG_STATIC_PROP = 'This property can only be set on widget creation. Once set, it cannot be changed anymore.';

exports.generateDoc = function generateDoc({files, targetPath, version}) {

  let apiPath = join(targetPath, 'api');
  let typesFile = join(targetPath, 'types.md');
  let tocFile = join(targetPath, 'toc.yml');
  let typeLinks = {};
  let api = {};

  readPropertyTypes();
  readAPI();
  renderAPI();
  renderIndex();

  function readAPI() {
    files.forEach(file => {
      let isWidget = file.indexOf('/widgets/') !== -1;
      let def = readJsonSync(file);
      let title = getTitle(def);
      Object.assign(def, {title, file, isWidget});
      if (api[title]) {
        throw new Error('Duplicate title ' + title);
      }
      api[title] = def;
      if (def.type) {
        addTypeLink(def.type, `${def.type}.md`);
      }
    });
  }

  function readPropertyTypes() {
    let path = relative(apiPath, typesFile).replace(sep, '/');
    let list = readFileSync(typesFile, 'utf-8').match(/^## *(.*)$/gm).map(heading => heading.slice(3));
    for (let type of list) {
      addTypeLink(type, `${path}#${type.toLowerCase()}`);
    }
  }

  function addTypeLink(type, link) {
    if (typeLinks[type]) {
      throw new Error('Duplicate type ' + type);
    }
    typeLinks[type] = link;
  }

  function renderAPI() {
    Object.keys(api).forEach(title => {
      let targetFile = join(apiPath, parse(api[title].file).name + '.md');
      writeFileSync(targetFile, renderDocument(title));
    });
  }

  function renderIndex() {
    let sortedAPI = Object.keys(api).map(title => api[title]).sort(compareTitles);
    let render = def => `    - title: ${def.title}\n      url: api/${parse(def.file).name}.html`;
    let data = {
      api: sortedAPI.filter(def => !def.isWidget).map(render).join('\n'),
      widgets: sortedAPI.filter(def => def.isWidget).map(render).join('\n')
    };
    let tocContent = readFileSync(tocFile, 'utf-8').replace(/<%=\s*(\S+)\s*%>/g, (match, word) => data[word]);
    writeFileSync(tocFile, tocContent, data);
  }

  function renderDocument(title) {
    let def = api[title];
    return [
      '---\n---',
      '# ' + title + '\n',
      renderExtends(def),
      renderDescription(def),
      renderImages(def),
      renderExample(def),
      renderMembers(def),
      renderSnippet(title),
      renderLinks(def)
    ].filter(value => !!value).join('\n');
  }

  function renderMembers(def) {
    return [
      renderMethods(def),
      renderProperties(def),
      renderEvents(def)
    ].filter(value => !!value).join('\n');
  }

  function renderExample(def) {
    let exampleFile = join(apiPath, parse(def.file).name + '.md');
    if (isFileSync(exampleFile)) {
      return readFileSync(exampleFile, 'utf-8');
    }
  }

  function renderSnippet(title) {
    let snippetPath = join(SNIPPETS_LOCATION, `${title.toLowerCase()}.js`);
    if (isFileSync(snippetPath)) {
      return [
        '## Example',
        '```js',
        readFileSync(snippetPath, 'utf-8').trim(),
        '```'
      ].join('\n');
    }
  }

  function renderImages(def) {
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

  function renderDescription(def) {
    let result = def.description ? def.description + '\n\n' : '';
    if (def.namespace === 'global') {
      result += `This ${def.object ? 'object' : 'API'} is available in the global namespace. `;
      result += 'You do not need to import it explicitly.\n';
    } else {
      result += `Import this ${def.object ? 'object' : 'type'} with `;
      result += `"\`const {${def.object || def.type}} = require('tabris');\`"\n`;
    }
    return result;
  }

  function renderExtends(def) {
    if (def.extends) {
      if (!(def.extends in api)) {
        throw new Error('Could not find super type for ' + def.type);
      }
      let sup = api[def.extends];
      return `Extends [${sup.type}](${sup.type}.md)\n`;
    }
    return '';
  }

  function renderMethods(def) {
    if (!def.methods || !Object.keys(def.methods).length) {
      return '';
    }
    let result = ['## Methods\n\n'];
    Object.keys(def.methods).sort().forEach(name => {
      if (Array.isArray(def.methods[name])) {
        def.methods[name].filter(desc => !desc.ts_only).forEach(desc => {
          result.push(renderMethod(name, desc));
        });
      } else {
        result.push(renderMethod(name, def.methods[name]));
      }
    });
    return result.join('');
  }

  function renderMethod(name, desc) {
    let result = [];
    result.push('### ' + name + renderSignature(desc.parameters) + '\n' + renderPlatforms(desc.platforms) + '\n');
    if (desc.parameters && desc.parameters.length) {
      result.push('**Parameters:** ' + renderMethodParamList(desc.parameters) + '\n');
    }
    if (desc.returns) {
      result.push('**Returns:** *' + renderTypeLink(desc.returns) + '*\n');
    }
    if (desc.provisional) {
      result.push(MSG_PROVISIONAL + '\n');
    }
    if (desc.description) {
      result.push(desc.description + '\n');
    }
    return result.join('\n') + '\n';
  }

  function renderProperties(def) {
    if (!def.properties || !Object.keys(def.properties).length) {
      return '';
    }
    let result = ['## Properties\n\n'];
    Object.keys(def.properties).filter(name => !def.properties[name].ts_only).sort().forEach(name => {
      let property = def.properties[name];
      result.push('### ', name, '\n', renderPlatforms(property.platforms), '\n\n');
      if (property.readonly) {
        result.push('**read-only**<br/>\n');
      }
      result.push('Type: ', renderPropertyType(property), '\n');
      if (property.deprecated) {
        let message = typeof property.deprecated === 'string' ? property.deprecated : '';
        result.push('\n' + MSG_DEPRECATED + (message ? ': ' + message : '') + '\n');
      }
      if (property.provisional) {
        result.push('\n' + MSG_PROVISIONAL + '\n');
      }
      if (property.description) {
        result.push('\n' + property.description);
      }
      if (property.static) {
        result.push('<br/>' + MSG_STATIC_PROP);
      }
      result.push('\n\n');
    });
    return result.join('');
  }

  function renderPlatforms(platforms) {
    if (!platforms) {
      return '';
    }
    let result = ['<p class="platforms">'];
    let names = {ios: 'iOS', android: 'Android', windows: 'Windows 10'};
    for (let platform in names) {
      if (platforms[platform] !== false) {
        let name = names[platform];
        result.push(`<span class="${platform}-tag" title="supported on ${name}">${name}</span>`);
      }
    }
    result.push('</p>');
    return result.join('');
  }

  function renderPropertyType(property) {
    let name = property.type;
    let result = ['*', renderTypeLink(name), '*'];
    if (property.values) {
      result.push(', supported values: `' + property.values.join('`, `') + '`');
    }
    if (property.default) {
      result.push(', default: `' + property.default + '`');
    }
    return result.join('');
  }

  function renderEvents(def) {
    if (!def.events || !Object.keys(def.events).length) {
      return '';
    }
    let widgetEvents = Object.keys(def.events).map(name => Object.assign({name}, def.events[name]));
    let changeEvents = createChangeEvents(def.properties);
    for (let changeEvent of changeEvents) {
      if (!(widgetEvents.some(widgetEvent => widgetEvent.name === changeEvent.name))) {
        widgetEvents.push(changeEvent);
      }
    }
    let events = widgetEvents.sort((a, b) => a.name.localeCompare(b.name));
    return [
      '## Events\n\n',
      ...events.map(({name, description, provisional, parameters, platforms}) => ([
        '### ', name, '\n', renderPlatforms(platforms), '\n',
        description ? description + '\n' : '',
        provisional ? MSG_PROVISIONAL : '',
        parameters ? '\n#### Event Parameters ' + renderEventParamList(parameters) + '\n' : ''
      ]).join('')),
      '\n\n'
    ].join('');
  }

  function createChangeEvents(properties) {
    if (!properties || !Object.keys(properties).length) {
      return [];
    }
    return Object.keys(properties)
      .filter(name => !properties[name].static)
      .map(name => ({
        name: `${name}Changed`,
        description: `Fired when the [*${name}*](#${name}) property has changed.`,
        parameters: [{
          name: 'value',
          type: properties[name].type,
          description: `The new value of [*${name}*](#${name}).`
        }]
      }));
  }

  function renderSignature(parameters) {
    return '(' + parameters.map(param => typeof param === 'object' ? param.name : param).join(', ') + ')';
  }

  function renderEventParamList(parameters) {
    let result = '\n';
    result += renderEventParameter({name: 'target', type: 'this', description: 'The widget the event was fired on.'});
    Object.keys(parameters).sort().forEach((name) => {
      result += renderEventParameter(Object.assign({name}, parameters[name]));
    });
    return result;
  }

  function renderMethodParamList(parameters) {
    return '\n\n' + parameters.map(param => {
      let type = '';
      if (param.type) {
        type = '*' + renderTypeLink(param.type) + '*';
      } else if (param.value) {
        type = '`' + param.value + '`';
      }
      let optional = param.optional ? ' [**Optional**]' : '';
      let result = [`- ${param.name}: ${type}${optional}`];
      if (param.description) {
        result.push(`  - ${firstCharLower(param.description)}`);
      }
      return result.join('\n');
    }).join('\n');
  }

  function renderEventParameter({name, type, description}) {
    return `- **${name}**: *${renderTypeLink(type)}*\n    ${description}\n\n`;
  }

  function renderLinks(def) {
    if (!def.links || !def.links.length) {
      return '';
    }
    return ['## See also\n'].concat(def.links.map(link => {
      let path = link.path.replace('${GITHUB_BRANCH}',
        'https://github.com/eclipsesource/tabris-js/tree/v' + version);
      return `- [${link.title}](${path})`;
    })).join('\n') + '\n';
  }

  function renderTypeLink(name) {
    if (!typeLinks[name]) {
      return name;
    }
    return `[${name}](${typeLinks[name]})`;
  }

};

function firstCharLower(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function getTitle(def) {
  return def.title || def.object || def.type;
}

function isLowerCase(str) {
  return str.charAt(0).toLowerCase() === str.charAt(0);
}

function compareTitles(a, b) {
  if (isLowerCase(a.title) !== isLowerCase(b.title)) {
    return isLowerCase(a.title) ? -1 : 1;
  }
  return a.title.localeCompare(b.title, 'en');
}

function isFileSync(fpath) {
  try {
    return statSync(fpath).isFile();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}
