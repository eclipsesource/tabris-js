module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    curl: {
      "cordova-plugins.zip": "https://tabrisjs.com/downloads/nightly/cordova-plugins.zip"
    },
    unzip: {
      "./": "cordova-plugins.zip"
    },
    clean: {
      "platforms": {
        src: "platforms"
      },
      "zip": {
        src: "cordova-plugins.zip"
      }
    }
  });

  grunt.loadNpmTasks("grunt-curl");
  grunt.loadNpmTasks("grunt-zip");
  grunt.loadNpmTasks("grunt-contrib-clean");

  grunt.registerTask("default", ["clean:platforms", "curl", "unzip", "clean:zip"]);

};
