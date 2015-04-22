var _ = require("underscore");

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
    result.push(renderEvents(widget));
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
    result.push("### " + signature(name, desc.parameters, data) + "\n");
    if (desc.returns) {
      result.push("Returns: *" + renderTypeLink(desc.returns, data) + "*\n");
    }
    if (desc.description) {
      result.push(desc.description);
    }
    result.push("\n");
    return result.join("\n");
  }

  function signature(methodName, parameters, data) {
    return methodName + "(" + parameters.map(function(param) {
      return renderTypeLink(param, data);
    }).join(", ") + ")";
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

  function renderTypeLink(name, data) {
    if (data.types.indexOf(name.toLowerCase()) !== -1) {
      return "[" + name + "](../property-types.md#" + name + ")";
    } else if (data.widgets[name]) {
      return "[" + name + "](" + name.toLowerCase() + ".md)";
    } else {
      return name;
    }
  }

  function renderEvents(widget) {
    if (!widget.events) {
      return "";
    }
    var result = [];
    result.push("## Events\n");
    Object.keys(widget.events).sort().forEach(function(name) {
      var event = widget.events[name];
      result.push("### ", name + "\n");
      if (event.description) {
        result.push("\n" + event.description);
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
    result.push("## See also\n");
    widget.links.forEach(function(link) {
      result.push("- [", link.title, "](", link.path, ")\n");
    });
    return result.join("");
  }

  function notEmpty(value) {
    return !!value;
  }

};
