/*global require: false*/

var path = require("path");

module.exports = function(grunt) {

  var banner = ["/*!",
                " * tabris.js <%= grunt.template.today('yyyy-mm-dd') %>",
                " *",
                " * Copyright (c) 2014 EclipseSource.",
                " * All rights reserved.",
                " */\n"].join("\n");

  var prefix = function(prefix, strings) {
    return strings.map(function(string) {return prefix + string;});
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    clean: ["build"],
    jshint: {
      options: {
        jshintrc: true
      },
      all: [
        "Gruntfile.js",
        "src/**/*.js",
        "test/**/*.js",
        "examples/**/*.js",
        "snippets/**/*.js",
        "!**/lib/**/*.js",
        "!**/node_modules/**/*.js"
      ]
    },
    jscs: {
      src: [
        "Gruntfile.js",
        "src/**/*.js",
        "test/**/*.js",
        "examples/**/*.js",
        "snippets/**/*.js",
        "!**/lib/**/*.js",
        "!**/node_modules/**/*.js"
      ],
      options: {
        config: true
      }
    },
    jasmine: {
      options: {
        specs: "test/js/*.spec.js",
        helpers: ["test/js/NativeBridgeSpy.js"],
        version: "2.0.0",
        display: "short",
        summary: true
      },
      src: "build/tabris.js"
    },
    concat: {
      options: {
        banner: banner,
        stripBanners: true
      },
      dist: {
        src: prefix("src/js/", [
          "util.js",
          "util-colors.js",
          "util-fonts.js",
          "util-images.js",
          "Tabris.js",
          "NativeBridge.js",
          "Events.js",
          "Module.js",
          "Proxy.js",
          "ProxyCollection.js",
          "PropertyChecks.js",
          "PropertyEncoding.js",
          "Widgets.js",
          "Animation.js",
          "DOMEvents.js",
          "DOMDocument.js",
          "WindowTimers.js",
          "Device.js",
          "UIProxy.js",
          "CollectionView.js",
          "ScrollComposite.js",
          "Page.js",
          "Action.js",
          "TabFolder.js",
          "CanvasContext.js",
          "LegacyCanvasContext.js",
          "WebStorage.js",
          "XMLHttpRequest.js"
        ]),
        dest: "build/tabris.js"
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        src: "build/tabris.js",
        dest: "build/tabris.min.js"
      }
    },
    doc: {
      json: prefix("doc/definitions/", [
        "Widget.json",
        "Action.json",
        "Button.json",
        "Canvas.json",
        "CheckBox.json",
        "CollectionView.json",
        "Combo.json",
        "Composite.json",
        "ImageView.json",
        "Label.json",
        "Page.json",
        "ProgressBar.json",
        "RadioButton.json",
        "Slider.json",
        "TabFolder.json",
        "Tab.json",
        "Text.json",
        "ToggleButton.json",
        "ScrollComposite.json",
        "WebView.json"
      ]),
      target: "build/doc/widget-types.md"
    },
    copy: {
      doc: {
        expand: true,
        cwd: "doc/",
        src: ["*.md", "img/*.*"],
        dest: "build/doc/"
      }
    },
    compress: {
      main: {
        options: {
          archive: "build/examples.zip"
        },
        files: [
          {expand: true, cwd: "build/", src: ["examples/**"], filter: "isFile"}
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadTasks("doc/generator");

  grunt.registerTask("examples", "Copy examples/snippets to build/, create index", function() {
    ["snippets", "examples"].forEach(function(dir) {
      var aggregatedIndex = [];
      grunt.file.expand(dir + "/*").forEach(function(subdir) {
        if (grunt.file.exists(subdir, "index.json")) {
          var index = grunt.file.readJSON(path.join(subdir, "/index.json"));
          if ("title" in index) {
            grunt.file.recurse(subdir, function callback(abspath) {
              grunt.file.copy(abspath, path.join("build/", abspath));
            });
            aggregatedIndex.push({
              category: index.category || "",
              title: index.title,
              description: index.description || "",
              path: path.basename(subdir)
            });
          }
        }
      });
      grunt.file.copy("examples/README.md", "build/examples/README.md");
      grunt.file.write("build/" + dir + "/index.json", JSON.stringify(aggregatedIndex, null, 2));
    });
  });

  grunt.registerTask("default", [
    "clean",
    "doc",
    "copy:doc",
    "jscs",
    "jshint",
    "concat",
    "uglify",
    "jasmine",
    "examples",
    "compress"
  ]);

};
