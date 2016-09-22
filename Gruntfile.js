module.exports = function(grunt) {

  var pkg = grunt.file.readJSON("package.json");

  var banner = blockComment("Tabris.js " + pkg.version +
                            " (<%= grunt.template.today('yyyy-mm-dd HH:MM') %>)\n\n" +
                            grunt.file.read("LICENSE"));

  grunt.initConfig({
    version: pkg.version,
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
        src: ["build/bundle.js"],
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
      verify_typings: {
        cmd: "npm install && node node_modules/typescript/bin/tsc -p . --noImplicitAny",
        cwd: "build/typescript"
      },
      test_boot: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --compilers js:babel-core/register "test/boot/**/*.test.js"'
      },
      test_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --compilers js:babel-core/register "test/tabris/**/*.test.js"'
      },
      test_spec: {
        cmd: `node node_modules/mocha/bin/mocha --colors --compilers js:babel-core/register "${grunt.option("spec")}"`
      },
      lint: {
        cmd: "node node_modules/eslint/bin/eslint.js --color ."
      },
      bundle: {
        cmd: "node node_modules/rollup/bin/rollup --format=cjs --output=build/bundle.js -- src/tabris/main.js"
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
    "exec:bundle",
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

  grunt.registerTask("test", [
    "exec:test_boot",
    "exec:test_tabris"
  ]);

  /* runs tests against the build output */
  grunt.registerTask("verify", [
    "copy:test_ts",
    "exec:verify_typings"
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
    "test",
    "build",
    "verify",
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
