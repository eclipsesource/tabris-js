var _ = require("underscore");
var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask("generate-doc", function() {
    var data = {
      widgets: readJson(),
      types:  readTypes()
    };
    resolveIncludes(data);
    renderWidgets(data);
    renderIndex(data);
  });

  function renderWidgets(data) {
    Object.keys(data.widgets).forEach(function(type) {
      grunt.file.write(getTargetPath(type), renderWidget(data, type));
    });
  }

  function renderIndex(data) {
    var types = ["Widget"].concat(_.chain(data.widgets).keys().without("Widget").value());
    var result = [];
    types.forEach(function(type) {
      result.push("- [" + type + "](api/" + type.toLowerCase() + ".md)");
    });
    var templData = {data: {widgets: result.join("\n")}};
    grunt.file.write(getIndexPath(), grunt.template.process(grunt.file.read(getIndexPath()), templData));
  }

  function renderWidget(data, type) {
    var widget = data.widgets[type];
    var result = [];
    var title = widget.type || widget.title;
    grunt.log.verbose.writeln("Generating DOC for " + title);
    result.push("# " + title);
    result.push(renderDescription(widget));
    result.push(renderMethods(widget, data));
    result.push(renderProperties(widget, data));
    result.push(renderEvents(widget, data));
    result.push(renderLinks(widget));
    return result.filter(notEmpty).join("\n");
  }

  function resolveIncludes(data) {
    var widgets = data.widgets;
    Object.keys(widgets).forEach(function(type) {
      var widget = widgets[type];
      if (widget.include) {
        widget.include = widget.include.map(function(type) {
          if (!widgets[type]) {
            throw new Error("Could not find included type " + type);
          }
          return widgets[type];
        });
      }
    });
  }

  function readJson() {
    var widgets = {};
    grunt.file.expand(grunt.config("doc").json).forEach(function(file) {
      var json = grunt.file.readJSON(file);
      widgets[json.type] = json;
    });
    return widgets;
  }

  function readTypes() {
    var md = grunt.file.read(grunt.config("doc").types);
    return md.match(/^##\ *(.*)$/gm).map(function(heading) {
      return heading.slice(3).toLowerCase();
    });
  }

  function getTargetPath(type) {
    return grunt.config("doc").target + type.toLowerCase() + ".md";
  }

  function getIndexPath() {
    return grunt.config("doc").index;
  }

  function renderDescription(widget) {
    var result = [];
    result.push(widget.description + "\n");
    if (widget.include) {
      result.push("Includes ");
      result.push(widget.include.map(function(widget) {
        var title = widget.type || widget.title;
        return "[" + title + "](#" + title.toLowerCase().replace(/\s/g, "-") + ")";
      }).join(", "));
      result.push("\n");
    }
    return result.join("");
  }

  function renderMethods(widget, data) {
    if (!widget.methods) {
      return "";
    }
    var result = [];
    result.push("## Methods\n");
    Object.keys(widget.methods).sort().forEach(function(name) {
      widget.methods[name].forEach(function(desc) {
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
    if (desc.description) {
      result.push(desc.description);
    }
    result.push("\n");
    return result.join("\n");
  }

  function renderProperties(widget, data) {
    if (!widget.properties) {
      return "";
    }
    var result = [];
    result.push("## Properties\n");
    Object.keys(widget.properties).sort().forEach(function(name) {
      var property = widget.properties[name];
      result.push("### ", name, "\n");
      result.push("Type: ", renderPropertyType(property.type, data), "\n");
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

  function renderEvents(widget, data) {
    if (!widget.events) {
      return "";
    }
    var result = [];
    result.push("## Events\n");
    Object.keys(widget.events).sort().forEach(function(name) {
      var event = widget.events[name];
      result.push("### \"", name, "\" (" + renderParamList(event.parameters, data) + ")\n");
      if (event.parameters) {
        result.push("\n**Parameters:** " + renderParamList(event.parameters, data, true) + "\n");
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
      return parameters.map(function(param) {
        return typeof param === "object" ? param.name : param;
      }).join(", ");
    }
    return "\n\n" + parameters.map(function(param) {
      var name = typeof param === "object" ? param.name : param;
      var type = typeof param === "object" ? param.type : null;
      var desc = typeof param === "object" ? param.description : null;
      return "- " + name + ": " + (type ? "*" + renderTypeLink(type, data) + "*" : "") +
        (desc ? (", " + firstCharLower(desc)) : "");
    }).join("\n");
  }

  function renderLinks(widget) {
    if (!widget.links) {
      return "";
    }
    var result = [];
    result.push("## See also\n");
    widget.links.forEach(function(link) {
      result.push("- [", link.title, "](", link.path, ")\n");
    });
    return result.join("");
  }

  function renderTypeLink(name, data) {
    if (data.types.indexOf(name.toLowerCase()) !== -1) {
      return "[" + name + "](" + getTypeDocPath() + "#" + name + ")";
    } else if (data.widgets[firstCharUp(name)]) {
      return "[" + name + "](" + name.toLowerCase() + ".md)";
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

};
