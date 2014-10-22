module.exports = function(grunt) {
  grunt.registerTask("doc", function() {
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
      result.push(" Also includes ");
      for (var i = 0; i < desc.include.length; i++) {
        var include = desc.include[i];
        if (!includes[include]) {
          throw new Error("Could not find include " + include);
        }
        if (i > 0) {
          result.push(i === (desc.include.length - 1) ? " and " : ", ");
        }
        var incTitle = includes[include].title;
        result.push("[" + incTitle + "](#" + incTitle.replace( /\s/g, "_" ) + ")");
      }
    }
    result.push("\n\n");
    return result.join("");
  }

  function getPropertiesText(desc) {
    if (!desc.properties) {
      return "";
    }
    var result = [];
    result.push(desc.type ? "### Properties\n" : "");
    for (var prop in desc.properties) {
      var value = desc.properties[prop];
      var type = value.split(":")[0];
      var def = value.split("?")[1] || "";
      var allowed = value.indexOf(":") !== -1 ? value.split(":")[1].split("?")[0] : "";
      result.push("- *", prop, "*: `", type + "`");
      result.push(allowed ? ", possible values: \"" + allowed.split("|").join("\", \"") + "\"" : "");
      result.push(def ? ", default value: \"" + def + "\"" : "");
      result.push("\n");
    }
    result.push("\n");
    return result.join("");
  }

  function getEventsText(desc) {
    if (!desc.events) {
      return "";
    }
    var result = [];
    result.push(desc.type ? "### Events\n" : "");
    desc.events.forEach(function(name) {
      result.push("- ", name, "\n");
    });
    result.push("\n");
    return result.join("");
  }

  function getSeeAlsoText(desc) {
    if (!desc.links) {
      return "";
    }
    var result = [];
    result.push("### See also\n");
    desc.links.forEach(function(link) {
      result.push("- [", link.title, "](", link.path, ")\n");
    });
    result.push("\n");
    return result.join("");
  }

};
