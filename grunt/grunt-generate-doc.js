let path = require('path');

const SNIPPETS_LOCATION = 'snippets';

const MSG_PROVISIONAL = '**Note:** this API is provisional and may change in a future release.';
const MSG_STATIC_PROP = 'This property can only be set on widget creation. Once set, it cannot be changed anymore.';

module.exports = function(grunt) {

  grunt.registerTask('generate-doc', () => {
    let indexPath = grunt.config('doc').index;
    let targetPath = grunt.config('doc').target;
    let api = readAPI();
    let types = readTypes();

    renderAPI();
    renderIndex();

    function readAPI() {
      let api = {};
      grunt.file.expand(grunt.config('doc').api).forEach(file => {
        let isWidget = file.indexOf('/widgets/') !== -1;
        let def = Object.assign(grunt.file.readJSON(file), {file, isWidget});
        api[def.type] = def;
      });
      return api;
    }

    function readTypes() {
      let types = grunt.config('doc').types;
      return {
        list: grunt.file.read(types).match(/^##\ *(.*)$/gm).map(heading => heading.slice(3).toLowerCase()),
        path: path.relative(targetPath, types).replace(path.sep, '/')
      };
    }

    function renderAPI() {
      Object.keys(api).forEach(type => {
        let targetFile = path.join(targetPath, path.parse(api[type].file).name + '.md');
        grunt.file.write(targetFile, renderDocument(type));
      });
    }

    function renderIndex() {
      grunt.log.verbose.writeln('Generating index');
      let types = Object.keys(api).sort().map(type => api[type]);
      let render = def => `- [${title(def)}](api/${path.parse(def.file).name}.md)`;
      let data = {
        api: types.filter(type => !type.isWidget).map(render).join('\n'),
        widgets: types.filter(type => type.isWidget).map(render).join('\n')
      };
      grunt.file.write(indexPath, grunt.template.process(grunt.file.read(indexPath), {data}));
    }

    function renderDocument(type) {
      grunt.log.verbose.writeln('Generating DOC for ' + type);
      let def = api[type];
      return [
        '# ' + title(def) + '\n',
        renderDescription(def),
        renderImages(def),
        renderExample(def),
        renderExtends(def),
        renderMembers(def),
        renderSnippet(def),
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
      let exampleFile = path.join(targetPath, path.parse(def.file).name + '.md');
      if (grunt.file.isFile(exampleFile)) {
        return grunt.file.read(exampleFile);
      }
    }

    function renderSnippet(def) {
      let snippetPath = path.join(SNIPPETS_LOCATION, `${def.type.toLowerCase()}.js`);
      if (grunt.file.isFile(snippetPath)) {
        return [
          '## Example',
          '```js',
          grunt.file.read(snippetPath).trim(),
          '```'
        ].join('\n');
      }
    }

    function renderImages(def) {
      let androidImage = path.join('img/android', path.parse(def.file).name + '.png');
      let iosImage = path.join('img/ios', path.parse(def.file).name + '.png');
      let exists = image => grunt.file.isFile(path.join('doc/api', image));
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
      if (def.description) {
        return def.description + '\n';
      }
      return '';
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
        def.methods[name].forEach(desc => {
          result.push(renderMethod(name, desc));
        });
      });
      return result.join('');
    }

    function renderMethod(name, desc) {
      let result = [];
      result.push('### ' + name + renderSignature(desc.parameters) + '\n');
      if (desc.parameters && desc.parameters.length) {
        result.push('**Parameters:** ' + renderParamList(desc.parameters) + '\n');
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
      Object.keys(def.properties).sort().forEach(name => {
        let property = def.properties[name];
        result.push('### ', name, '\n\n');
        result.push('Type: ', renderPropertyType(property), '\n');
        if (property.provisional) {
          result.push('\n' + MSG_PROVISIONAL);
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
      let result = ['## Events\n\n'];
      Object.keys(def.events).sort().forEach(name => {
        let event = def.events[name];
        result.push('### "', name, '" ' + renderSignature(event.parameters) + '\n');
        if (event.parameters) {
          result.push('\n**Parameters:** ' + renderParamList(event.parameters) + '\n');
        }
        if (event.provisional) {
          result.push(MSG_PROVISIONAL);
        }
        if (event.description) {
          result.push('\n' + event.description + '\n');
        }
        result.push('\n\n');
      });
      return result.join('');
    }

    function renderSignature(parameters) {
      return '(' + parameters.map(param => typeof param === 'object' ? param.name : param).join(', ') + ')';
    }

    function renderParamList(parameters) {
      return '\n\n' + parameters.map(param => {
        let result = ['- ', param.name, ': '];
        if (param.type) {
          result.push('*', renderTypeLink(param.type), '*');
        } else if (param.value) {
          result.push('`', param.value, '`');
        }
        if (param.description) {
          result.push(', ' + firstCharLower(param.description));
        }
        return result.join('');
      }).join('\n');
    }

    function renderLinks(def) {
      if (!def.links || !def.links.length) {
        return '';
      }
      return ['## See also\n'].concat(def.links.map(link => {
        let path = link.path.replace('${GITHUB_BRANCH}',
          'https://github.com/eclipsesource/tabris-js/tree/v' + grunt.config('version'));
        return `- [${link.title}](${path})`;
      })).join('\n') + '\n';
    }

    function renderTypeLink(name) {
      if (types.list.indexOf(name.toLowerCase()) !== -1) {
        return `[${name}](${types.path}#${name.toLowerCase()})`;
      }
      if (api[firstCharUp(name)]) {
        return `[${name}](${name}.md)`;
      }
      return name;
    }

  });

  function firstCharUp(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function firstCharLower(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  function title(def) {
    return def.object || def.type;
  }

};
