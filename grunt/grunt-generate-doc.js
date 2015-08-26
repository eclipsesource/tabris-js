/* global _: true */
var _ = require("underscore");
var path = require("path");

module.exports = function (grunt) {

  grunt.registerTask("generate-doc", function () {
    var data = {
      api: readAPI(),
      widgets: readWidgets(),
      types: readTypes()
    };
    resolveIncludes(data);
    renderWidgets(data);
    renderAPI(data);
    renderIndex(data);
  });

  function renderWidgets(data) {
    Object.keys(data.widgets).forEach(function (type) {
      grunt.file.write(getTargetPath(data.widgets[type]), renderDocument(data, type));
    });
  }

  function renderAPI(data) {
    Object.keys(data.api).forEach(function (type) {
      grunt.file.write(getTargetPath(data.api[type]), renderDocument(data, type));
    });
  }

  function renderIndex(data) {
    grunt.log.verbose.writeln("Generating index");
    var widgets = ["Widget"].concat(_.chain(data.widgets).keys().without("Widget").value());
    var widgetIndex = [];
    widgets.forEach(function (type) {
      var json = data.widgets[type];
      widgetIndex.push("- [" + title(json) + "](api/" + baseFileName(json.file) + ".md)");
    });
    var apiIndex = [];
    Object.keys(data.api).forEach(function (type) {
      var json = data.api[type];
      apiIndex.push("- [" + title(json) + "](api/" + baseFileName(json.file) + ".md)");
    });
    var templData = {data: {widgets: widgetIndex.join("\n"), api: apiIndex.join("\n")}};
    grunt.file.write(getIndexPath(), grunt.template.process(grunt.file.read(getIndexPath()), templData));
  }

  function renderDocument(data, type) {
    grunt.log.verbose.writeln("Generating DOC for " + type);
    var json = data.widgets[type] || data.api[type];
    var result = [];
    result.push("# " + title(json));
    result.push(renderDescription(json));
    if (grunt.file.isFile(getTargetPath(json))) {
      result.push(grunt.file.read(getTargetPath(json)));
    }
    result.push(renderMethods(json, data));
    result.push(renderFields(json, data));
    result.push(renderProperties(json, data));
    result.push(renderEvents(json, data));
    result.push(renderLinks(json));
    return result.filter(notEmpty).join("\n");
  }

  function resolveIncludes(data) {
    Object.keys(data.widgets).concat(Object.keys(data.api)).forEach(function (type) {
      var json = data.widgets[type] || data.api[type];
      if (json.include) {
        json.include = json.include.map(function (type) {
          var include = data.widgets[type] || data.api[type];
          if (!include) {
            throw new Error("Could not find included type " + type);
          }
          return include;
        });
      }
    });
  }

  function readWidgets() {
    var widgets = {};
    grunt.file.expand(grunt.config("doc").widgets).forEach(function (file) {
      var json = grunt.file.readJSON(file);
      json.file = file;
      widgets[json.type] = json;
    });
    return widgets;
  }

  function readAPI() {
    var api = {};
    grunt.file.expand(grunt.config("doc").api).forEach(function (file) {
      var json = grunt.file.readJSON(file);
      json.file = file;
      api[json.type || json.object] = json;
    });
    return api;
  }

  function readTypes() {
    var md = grunt.file.read(grunt.config("doc").types);
    return md.match(/^##\ *(.*)$/gm).map(function (heading) {
      return heading.slice(3).toLowerCase();
    });
  }

  function getTargetPath(json) {
    return grunt.config("doc").target + baseFileName(json.file) + ".md";
  }

  function getIndexPath() {
    return grunt.config("doc").index;
  }

  function renderDescription(json) {
    var result = [];
    if (json.description) {
      result.push(json.description + "\n");
    }
    if (json.include) {
      result.push("Includes ");
      result.push(json.include.map(function (widget) {
        return "[" + title(widget) + "](" + widget.type + ".md)";
      }).join(", "));
      result.push("\n");
    }
    return result.join("");
  }

  function renderMethods(json, data) {
    if (!json.methods) {
      return "";
    }
    var result = [];
    result.push("## Methods\n");
    Object.keys(json.methods).sort().forEach(function (name) {
      Array.prototype.forEach.call(json.methods[name], function (desc) {
        result.push(renderMethod(name, desc, data));
      });
    });
    return result.join("");
  }

  function renderMethod(name, desc, data) {
    var result = [];
    result.push("### " + name + "(" + renderParamList(desc.parameters, data) + ")\n");
    if (desc.parameters) {
      result.push("\n**Parameters:** " + renderParamList(desc.parameters, data, true) + "\n");
    }
    if (desc.returns) {
      result.push("**Returns:** *" + renderTypeLink(desc.returns, data) + "*\n");
    }
    if (desc.provisional) {
      result.push(provisionalNote);
    }
    if (desc.description) {
      result.push(desc.description);
    }
    result.push("\n");
    return result.join("\n");
  }

  function renderProperties(json, data) {
    if (!json.properties) {
      return "";
    }
    var result = [];
    result.push("## Properties\n");
    Object.keys(json.properties).sort().forEach(function (name) {
      var property = json.properties[name];
      result.push("### ", name, "\n");
      result.push("Type: ", renderPropertyType(property.type, data), "\n");
      if (property.provisional) {
        result.push(provisionalNote);
      }
      if (property.description) {
        result.push("\n" + property.description);
      }
      if (property.static) {
        result.push("<br/>This property can only be set in the `tabris.create` method. " +
        "It cannot be changed after widget creation.");
      }
      result.push("\n");
    });
    return result.join("");
  }

  function renderFields(json, data) {
    if (!json.fields) {
      return "";
    }
    var result = [];
    result.push("## Fields\n");
    Object.keys(json.fields).sort().forEach(function (name) {
      var field = json.fields[name];
      result.push("### ", name, "\n");
      result.push("Type: ", renderPropertyType(field.type, data), "\n");
      if (field.provisional) {
        result.push(provisionalNote);
      }
      if (field.description) {
        result.push("\n" + field.description);
      }
      result.push("\n");
    });
    return result.join("");
  }

  function renderPropertyType(type, data) {
    var name = type.split(":")[0].split("?")[0];
    var supValues = type.indexOf(":") !== -1 ? type.split(":")[1].split("?")[0] : "";
    var defValue = type.split("?")[1] || "";
    var result = ["*", renderTypeLink(name, data), "*"];
    if (supValues) {
      result.push(", supported values: `" + supValues.split("|").join("`, `") + "`");
    }
    if (defValue) {
      result.push(", default: `" + defValue + "`");
    }
    return result.join("");
  }

  function renderEvents(json, data) {
    if (!json.events) {
      return "";
    }
    var result = [];
    result.push("## Events\n");
    Object.keys(json.events).sort().forEach(function (name) {
      var event = json.events[name];
      result.push("### \"", name, "\" (" + renderParamList(event.parameters, data) + ")\n");
      if (event.parameters) {
        result.push("\n**Parameters:** " + renderParamList(event.parameters, data, true) + "\n");
      }
      if (event.provisional) {
        result.push(provisionalNote);
      }
      if (event.description) {
        result.push("\n" + event.description + "\n");
      }
      result.push("\n");
    });
    return result.join("");
  }

  function renderParamList(parameters, data, detailed) {
    if (!detailed) {
      return parameters.map(function (param) {
        return typeof param === "object" ? param.name : param;
      }).join(", ");
    }
    return "\n\n" + parameters.map(function (param) {
        var result = ["- ", param.name, ": "];
        if (param.type) {
          result.push("*", renderTypeLink(param.type, data), "*");
        } else if (param.value) {
          result.push("`", param.value, "`");
        }
        if (param.description) {
          result.push(", " + firstCharLower(param.description));
        }
        return result.join("");
      }).join("\n");
  }

  function renderLinks(json) {
    if (!json.links) {
      return "";
    }
    var result = [];
    result.push("## See also\n");
    json.links.forEach(function (link) {
      result.push("- [", link.title, "](", link.path, ")\n");
    });
    return result.join("");
  }

  function renderTypeLink(name, data) {
    if (data.types.indexOf(name.toLowerCase()) !== -1) {
      return "[" + name + "](" + getTypeDocPath() + "#" + name.toLowerCase() + ")";
    } else if (data.widgets[firstCharUp(name)]) {
      return "[" + name + "](" + name + ".md)";
    } else if (data.api[firstCharUp(name)]) {
      return "[" + name + "](" + name + ".md)";
    } else {
      return name;
    }
  }

  function notEmpty(value) {
    return !!value;
  }

  function getTypeDocPath() {
    var types = grunt.config("doc").types;
    var target = grunt.config("doc").target;
    return path.relative(target, types).replace(path.sep, "/");
  }

  function firstCharUp(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function firstCharLower(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  function title(json) {
    return json.title || json.type || json.object;
  }

  function baseFileName(file) {
    return file.slice(file.lastIndexOf("/") + 1, file.lastIndexOf("."));
  }

  var provisionalNote = "\n**Note:** this API is provisional and may change in a future release.\n";

};
