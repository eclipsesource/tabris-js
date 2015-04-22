var _ = require("underscore");

module.exports = function(grunt) {

  grunt.registerTask("generate-doc", function() {
    var widgets = readJson();
    resolveIncludes(widgets);
    renderWidgets(widgets);
    renderIndex(widgets);
  });

  function renderWidgets(widgets) {
    Object.keys(widgets).forEach(function(type) {
      grunt.file.write(getTargetPath(type), renderWidget(widgets[type]));
    });
  }

  function renderIndex(widgets) {
    var types = ["Widget"].concat(_.chain(widgets).keys().without("Widget").value());
    var result = [];
    types.forEach(function(type) {
      result.push("- [" + type + "](api/" + type.toLowerCase() + ".md)");
    });
    var data = {data: {widgets: result.join("\n")}};
    grunt.file.write(getIndexPath(), grunt.template.process(grunt.file.read(getIndexPath()), data));
  }

  function renderWidget(widget) {
    var result = [];
    var title = widget.type || widget.title;
    grunt.log.verbose.writeln("Generating DOC for " + title);
    result.push("# " + title);
    result.push(renderDescription(widget));
    result.push(renderMethods(widget));
    result.push(renderProperties(widget));
    result.push(renderEvents(widget));
    result.push(renderLinks(widget));
    return result.filter(notEmpty).join("\n");
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

  function renderMethods(widget) {
    if (!widget.methods) {
      return "";
    }
    var result = [];
    result.push("## Methods\n");
    Object.keys(widget.methods).sort().forEach(function(name) {
      widget.methods[name].forEach(function(desc) {
        result.push(renderMethod(name, desc));
      });
    });
    return result.join("");
  }

  function renderMethod(name, desc) {
    var result = [];
    result.push("### " + signature(name, desc.parameters) + "\n");
    if (desc.returns) {
      result.push("Returns: *" + desc.returns + "*\n");
    }
    if (desc.description) {
      result.push(desc.description);
    }
    result.push("\n");
    return result.join("\n");
  }

  function signature(methodName, parameters) {
    return methodName + "(" + parameters.join(", ") + ")";
  }

  function renderProperties(widget) {
    if (!widget.properties) {
      return "";
    }
    var result = [];
    result.push("## Properties\n");
    Object.keys(widget.properties).sort().forEach(function(name) {
      var property = widget.properties[name];
      result.push("### ", name, "\n");
      result.push("Type: ", renderType(property.type), "\n");
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
