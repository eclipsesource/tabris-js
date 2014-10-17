module.exports = function(grunt) {
  grunt.registerTask("doc", function() {
    var targetPath = readTargetPath();
    var json = readJson();
    json.templates = readTemplates();
    var targetTemplate = json.templates[shortName(targetPath)];
    // TODO: Use pure JS instead of templates
    grunt.file.write(targetPath, grunt.template.process(targetTemplate, {data: json}));
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

  function readTemplates() {
    var templatesSrc = grunt.file.expand(grunt.config("doc").templates);
    var templates = {};
    for (var i = 0; i < templatesSrc.length; i++) {
      var templatePath = templatesSrc[i];
      templates[shortName(templatePath)] = grunt.file.read(templatePath);
    }
    return templates;
  }

  function readTargetPath() {
    return  grunt.config("doc").target;
  }

  function shortName(path) {
    return path.split("/").pop().split(".")[0];
  }

};
