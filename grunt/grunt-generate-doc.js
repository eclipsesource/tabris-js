module.exports = function(grunt) {

  grunt.registerTask("generate-doc", function() {
    grunt.file.write(readTargetPath(), createOutput(readJson()));
  });

  function readJson() {
    var jsonSrc = grunt.config("doc").json;
    var types = [];
    var includes = {};
    for (var i = 0; i < jsonSrc.length; i++) {
      var json = grunt.file.readJSON(jsonSrc[i]);
      types.push(json);
      if (json.title) {
        includes[shortName(jsonSrc[i])] = json;
      }
    }
    return {types: types, includes: includes};
  }

  function readTargetPath() {
    return grunt.config("doc").target;
  }

  function shortName(path) {
    return path.split("/").pop().split(".")[0];
  }

  function createOutput(data) {
    var result = [];
    result.push("# Widget Types\n");
    result.push("This section describes the API specific to different types of widgets.\n\n");
    data.types.forEach(function(desc) {
      var name = desc.type || desc.title;
      grunt.log.verbose.writeln("Generating DOC for " + name);
      result.push("## ", name, "\n");
      result.push(getDescriptionText(desc, data.includes));
      result.push(getMethodsText(desc));
      result.push(getPropertiesText(desc));
      result.push(getEventsText(desc));
      result.push(getSeeAlsoText(desc));
    });
    return result.join("");
  }

  function getDescriptionText(desc, includes) {
    var result = [];
    result.push(desc.description);
    if (desc.include) {
      result.push("\nIncludes ");
      for (var i = 0; i < desc.include.length; i++) {
        var include = desc.include[i];
        if (!includes[include]) {
          throw new Error("Could not find include " + include);
        }
        if (i > 0) {
          result.push(i === (desc.include.length - 1) ? " and " : ", ");
        }
        var incTitle = includes[include].title;
        result.push("[" + incTitle + "](#" + incTitle.toLowerCase().replace(/\s/g, "-") + ")");
      }
    }
    result.push("\n\n");
    return result.join("");
  }

  function getMethodsText(desc) {
    if (!desc.methods) {
      return "";
    }
    var result = [];
    result.push("#### Methods\n");
    Object.keys(desc.methods).sort().forEach(function(methodName) {
      desc.methods[methodName].forEach(function(props) {
        result.push("- **", sig(methodName, props.parameters) + "**");
        result.push(props.returns ? ": *" + props.returns + "*" : "");
        result.push(props.description ? "<br/>" + props.description : "");
        result.push("\n");
      });
    });
    result.push("\n");
    return result.join("");
  }

  function sig(methodName, parameters) {
    return methodName + "(" + parameters.join(", ") + ")";
  }

  function getPropertiesText(desc) {
    if (!desc.properties) {
      return "";
    }
    var result = [];
    result.push("#### Properties\n");
    Object.keys(desc.properties).sort().forEach(function(name) {
      var property = desc.properties[name];
      var type = property.type.split(":")[0].split("?")[0];
      var supValues = property.type.indexOf(":") !== -1 ? property.type.split(":")[1].split("?")[0] : "";
      var defValue = property.type.split("?")[1] || "";
      result.push("- **", name, "**: *", type + "*");
      if (supValues) {
        result.push(", supported values: `" + supValues.split("|").join("`, `") + "`");
      }
      if (defValue) {
        result.push(", default: `" + defValue + "`");
      }
      if (property.description) {
        result.push("<br/>" + property.description);
      }
      if (property.static) {
        result.push("<br/>This property can only be set in the `tabris.create` method. " +
                    "It cannot be changed after widget creation.");
      }
      result.push("\n");
    });
    result.push("\n");
    return result.join("");
  }

  function getEventsText(desc) {
    if (!desc.events) {
      return "";
    }
    var result = [];
    result.push("#### Events\n");
    Object.keys(desc.events).sort().forEach(function(name) {
      var event = desc.events[name];
      result.push("- **", name, "**");
      result.push(event.description ? "<br/>" + event.description : "");
      result.push("\n");
    });
    result.push("\n");
    return result.join("");
  }

  function getSeeAlsoText(desc) {
    if (!desc.links) {
      return "";
    }
    var result = [];
    result.push("#### See also\n");
    desc.links.forEach(function(link) {
      result.push("- [", link.title, "](", link.path, ")\n");
    });
    result.push("\n");
    return result.join("");
  }

};
