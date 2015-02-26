var _ = require("underscore");

module.exports = function(grunt) {

  grunt.registerTask("generate-doc", function() {
    grunt.file.write(getTargetPath(), createOutput(readJson()));
  });

  function createOutput(widgets) {
    resolveIncludes(widgets);
    var result = [];
    result.push("# Widget Types\n");
    result.push("This section describes the API specific to different types of widgets.\n\n");
    var types = ["Widget"].concat(_.chain(widgets).keys().without("Widget").value());
    types.forEach(function(type) {
      result.push(renderWidget(widgets[type]));
    });
    return result.join("\n");
  }

  function resolveIncludes(widgets) {
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

  function getTargetPath() {
    return grunt.config("doc").target;
  }

  function renderWidget(widget) {
    var title = widget.type || widget.title;
    grunt.log.verbose.writeln("Generating DOC for " + title);
    var result = [];
    result.push("## " + title + "\n");
    result.push(renderDescription(widget));
    result.push(renderMethods(widget));
    result.push(renderProperties(widget));
    result.push(renderEvents(widget));
    result.push(renderLinks(widget));
    return result.filter(notEmpty).join("\n");
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

  function renderMethods(widget) {
    if (!widget.methods) {
      return "";
    }
    var result = [];
    result.push("#### Methods\n");
    Object.keys(widget.methods).sort().forEach(function(name) {
      widget.methods[name].forEach(function(desc) {
        result.push(renderMethod(name, desc));
      });
    });
    return result.join("");
  }

  function renderMethod(name, desc) {
    var result = [];
    result.push("- **", signature(name, desc.parameters) + "**");
    if (desc.returns) {
      result.push(": *" + desc.returns + "*");
    }
    if (desc.description) {
      result.push("<br/>" + desc.description);
    }
    result.push("\n");
    return result.join("");
  }

  function signature(methodName, parameters) {
    return methodName + "(" + parameters.join(", ") + ")";
  }

  function renderProperties(widget) {
    if (!widget.properties) {
      return "";
    }
    var result = [];
    result.push("#### Properties\n");
    Object.keys(widget.properties).sort().forEach(function(name) {
      var property = widget.properties[name];
      result.push("- **", name, "**: ");
      result.push(renderType(property.type));
      if (property.description) {
        result.push("<br/>" + property.description);
      }
      if (property.static) {
        result.push("<br/>This property can only be set in the `tabris.create` method. " +
                    "It cannot be changed after widget creation.");
      }
      result.push("\n");
    });
    return result.join("");
  }

  function renderType(type) {
    var name = type.split(":")[0].split("?")[0];
    var supValues = type.indexOf(":") !== -1 ? type.split(":")[1].split("?")[0] : "";
    var defValue = type.split("?")[1] || "";
    var result = ["*", name + "*"];
    if (supValues) {
      result.push(", supported values: `" + supValues.split("|").join("`, `") + "`");
    }
    if (defValue) {
      result.push(", default: `" + defValue + "`");
    }
    return result.join("");
  }

  function renderEvents(widget) {
    if (!widget.events) {
      return "";
    }
    var result = [];
    result.push("#### Events\n");
    Object.keys(widget.events).sort().forEach(function(name) {
      var event = widget.events[name];
      result.push("- **", name, "**");
      if (event.description) {
        result.push("<br/>" + event.description);
      }
      result.push("\n");
    });
    return result.join("");
  }

  function renderLinks(widget) {
    if (!widget.links) {
      return "";
    }
    var result = [];
    result.push("#### See also\n");
    widget.links.forEach(function(link) {
      result.push("- [", link.title, "](", link.path, ")\n");
    });
    return result.join("");
  }

  function notEmpty(value) {
    return !!value;
  }

};
