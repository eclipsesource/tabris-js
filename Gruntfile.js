module.exports = function(grunt) {

  var pkg = grunt.file.readJSON("package.json");

  var banner = blockComment("Tabris.js " + pkg.version +
                            " (<%= grunt.template.today('yyyy-mm-dd HH:MM') %>)\n\n" +
                            grunt.file.read("LICENSE"));

  grunt.initConfig({
    clean: ["build"],
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
        src: prefix("src/tabris/", [
          "load-polyfill.js",
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
          "PropertyTypes.js",
          "Animation.js",
          "GestureRecognizer.js",
          "Device.js",
          "Widget.js",
          "Crypto.js",
          "DOMEvents.js",
          "DOMDocument.js",
          "WindowTimers.js",
          "InactivityTimer.js",
          "App.js",
          "UI.js",
          "ImageData.js",
          "CanvasContext.js",
          "LegacyCanvasContext.js",
          "WebStorage.js",
          "WebSocket.js",
          "XMLHttpRequest.js",
          "widgets/Action.js",
          "widgets/ActivityIndicator.js",
          "widgets/Button.js",
          "widgets/Canvas.js",
          "widgets/CheckBox.js",
          "widgets/CollectionView.js",
          "widgets/Composite.js",
          "widgets/Drawer.js",
          "widgets/Drawer-legacy.js",
          "widgets/ImageView.js",
          "widgets/Page.js",
          "widgets/PageSelector.js",
          "widgets/Picker.js",
          "widgets/ProgressBar.js",
          "widgets/RadioButton.js",
          "widgets/ScrollView.js",
          "widgets/SearchAction.js",
          "widgets/Slider.js",
          "widgets/Switch.js",
          "widgets/TabFolder.js",
          "widgets/TabFolder-legacy.js",
          "widgets/TextInput.js",
          "widgets/TextView.js",
          "widgets/ToggleButton.js",
          "widgets/Video.js",
          "widgets/WebView.js"
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
        src: prefix("src/boot/", [
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
      },
      polyfill: {
        src: "build/tabris/polyfill.js",
        dest: "build/tabris/polyfill.min.js"
      }
    },
    doc: {
      widgets: "doc/api/widgets/*.json",
      api: "doc/api/*.json",
      target: "build/doc/api/",
      index: "build/doc/index.md",
      types: "build/doc/types.md"
    },
    copy: {
      doc: {
        expand: true,
        cwd: "doc/",
        src: ["*.md", "api/*.md", "img/*.*"],
        dest: "build/doc/"
      },
      readme: {
        src: "README.md",
        dest: "build/tabris/"
      },
      typings: {
        expand: true,
        cwd: "typings/",
        src: ["whatwg-fetch.d.ts", "promise.d.ts"],
        dest: "build/tabris/"
      },
      test_ts: {
        expand: true,
        cwd: "test/typescript/",
        src: ["**/*.test.ts", "package.json", "tsconfig.json"],
        dest: "build/typescript/"
      }
    },
    compress: {
      doc: {
        options: {
          archive: "build/doc.zip"
        },
        files: [
          {expand: true, cwd: "build", src: ["doc/**"], filter: "isFile"}
        ]
      },
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
    webpack: {
      polyfill: {
        entry: "./src/polyfill.js",
        output: {
          filename: "build/tabris/polyfill.js",
          library: "polyfill",
          libraryTarget: "commonjs2"
        }
      }
    },
    exec: {
      test_typings: {
        cmd: "npm install && node node_modules/typescript/bin/tsc -p . --noImplicitAny",
        cwd: "build/typescript"
      },
      test_boot: {
        cmd: "node test/boot/run-tests.js"
      },
      test_tabris: {
        cmd: "node test/tabris/run-tests.js"
      },
      lint: {
        cmd: "node node_modules/eslint/bin/eslint.js --color **/*.js"
      }
    },
    examples: {
      src: ["snippets", "examples"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadTasks("./grunt");

  /* runs static code analysis tools */
  grunt.registerTask("lint", [
    "exec:lint"
  ]);

  grunt.registerTask("package", "create package.json", function() {
    var stringify = require("format-json");
    var pack = grunt.file.readJSON("package.json");
    delete pack.devDependencies;
    pack.main = "tabris.min.js";
    pack.typings = "tabris.d.ts";
    grunt.file.write("build/tabris/package.json", stringify.plain(pack));
  });

  /* concatenates and minifies code */
  grunt.registerTask("build", [
    "concat:tabris",
    "concat:boot",
    "webpack:polyfill",
    "uglify:tabris",
    "uglify:boot",
    "uglify:polyfill",
    "package",
    "copy:readme",
    "copy:typings",
    "generate-tsd",
    "compress:tabris"
  ]);

  /* runs tests against the build output */
  grunt.registerTask("test", [
    "exec:test_boot",
    "exec:test_tabris",
    "copy:test_ts",
    "exec:test_typings"
  ]);

  /* generates reference documentation */
  grunt.registerTask("doc", [
    "copy:doc",
    "generate-doc",
    "compress:doc"
  ]);

  /* packages example code */
  grunt.registerTask("examples", [
    "copy-examples",
    "compress:examples"
  ]);

  grunt.registerTask("default", [
    "clean",
    "lint",
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
