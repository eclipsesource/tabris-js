module.exports = function(grunt) {

  var pkg = grunt.file.readJSON("package.json");

  var banner = blockComment("Tabris.js " + pkg.version +
                            " (<%= grunt.template.today('yyyy-mm-dd HH:MM') %>)\n\n" +
                            grunt.file.read("LICENSE"));

  grunt.initConfig({
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
      boot: {
        options: {
          specs: ["test/js/Module.spec.js"],
          helpers: ["test/js/NativeBridgeSpy.js"],
          version: "2.0.0",
          display: "short",
          summary: true
        },
        src: "build/boot.js"
      },
      tabris: {
        options: {
          specs: grunt.file.expand("test/js/*.spec.js").filter(function(path) {
            return path.indexOf("/util") === -1 && path.indexOf("/Module.spec.js") === -1;
          }),
          helpers: [
            "test/js/NativeBridgeSpy.js",
            "node_modules/underscore/underscore-min.js",
            "test/js/FakeTabrisModule.js"
          ],
          version: "2.0.0",
          display: "short",
          summary: true
        },
        src: ["build/tabris/tabris.js", "test/js/jasmineToString.js"]
      }
    },
    concat: {
      tabris: {
        options: {
          banner: banner + "(function(){\n",
          footer: "\n}());",
          stripBanners: true,
          process: function(src) {
            return src.replace(/\${VERSION}/g, pkg.version);
          }
        },
        src: prefix("src/js/", [
          "util.js",
          "util-colors.js",
          "util-fonts.js",
          "util-images.js",
          "Tabris.js",
          "NativeBridge.js",
          "Events.js",
          "Layout.js",
          "Properties.js",
          "Proxy.js",
          "ProxyCollection.js",
          "PropertyDecoding.js",
          "PropertyEncoding.js",
          "Animation.js",
          "GestureRecognizer.js",
          "Widgets.js",
          "DOMEvents.js",
          "DOMDocument.js",
          "WindowTimers.js",
          "Device.js",
          "App.js",
          "UI.js",
          "CollectionView.js",
          "ScrollView.js",
          "Drawer.js",
          "Page.js",
          "PageSelector.js",
          "Action.js",
          "SearchAction.js",
          "TabFolder.js",
          "CanvasContext.js",
          "LegacyCanvasContext.js",
          "WebStorage.js",
          "XMLHttpRequest.js"
        ]),
        dest: "build/tabris/tabris.js"
      },
      boot: {
        options: {
          banner: banner + "(function(){\n",
          footer: "\n}());",
          stripBanners: true,
          process: function(src) {
            return src.replace(/\${VERSION}/g, pkg.version);
          }
        },
        src: prefix("src/js/", [
          "Module.js",
          "bootstrap.js"
        ]),
        dest: "build/boot.js"
      }
    },
    uglify: {
      tabris: {
        options: {
          banner: banner
        },
        src: "build/tabris/tabris.js",
        dest: "build/tabris/tabris.min.js"
      },
      boot: {
        src: "build/boot.js",
        dest: "build/boot.min.js"
      }
    },
    doc: {
      json: "doc/definitions/*.json",
      target: "build/doc/widget-types.md"
    },
    copy: {
      doc: {
        expand: true,
        cwd: "doc/",
        src: ["*.md", "img/*.*"],
        dest: "build/doc/"
      },
      readme: {
        src: "README.md",
        dest: "build/tabris/"
      }
    },
    compress: {
      examples: {
        options: {
          archive: "build/examples.zip"
        },
        files: [
          {expand: true, cwd: "build/", src: ["examples/**"], filter: "isFile"}
        ]
      },
      tabris: {
        options: {
          archive: "build/tabris.tgz"
        },
        files: [
          {expand: true, cwd: "build/", src: ["tabris/**"], filter: "isFile"}
        ]
      }
    },
    examples: {
      src: ["snippets", "examples"]
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
  grunt.loadTasks("./grunt");

  /* runs static code analysis tools */
  grunt.registerTask("check", [
    "jscs",
    "jshint"
  ]);

  grunt.registerTask("package", "create package.json", function() {
    var stringify = require("format-json");
    var pack = grunt.file.readJSON("package.json");
    delete pack.devDependencies;
    pack.main = "tabris.min.js";
    grunt.file.write("build/tabris/package.json", stringify.plain(pack));
  });

  /* concatenates and minifies code */
  grunt.registerTask("build", [
    "concat:tabris",
    "concat:boot",
    "uglify:tabris",
    "uglify:boot",
    "package",
    "copy:readme",
    "compress:tabris"
  ]);

  /* runs jasmine tests against the build output */
  grunt.registerTask("test", [
    "jasmine:boot",
    "jasmine:tabris"
  ]);

  /* generates reference documentation */
  grunt.registerTask("doc", [
    "generate-doc",
    "copy:doc"
  ]);

  /* packages example code */
  grunt.registerTask("examples", [
    "copy-examples",
    "compress:examples"
  ]);

  grunt.registerTask("default", [
    "clean",
    "check",
    "build",
    "test",
    "doc",
    "examples"
  ]);

  function prefix(prefix, strings) {
    return strings.map(function(string) {return prefix + string;});
  }

  function blockComment(text) {
    var commented = text.trim().split("\n").map(function(line) {
      return " * " + line;
    }).join("\n");
    return "/*!\n" + commented + "\n */\n";
  }

};
