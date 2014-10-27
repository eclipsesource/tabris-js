/*global require: false*/

var path = require('path');

module.exports = function(grunt) {

  var banner = ['/*!',
                ' * tabris.js <%= grunt.template.today("yyyy-mm-dd") %>',
                ' *',
                ' * Copyright (c) 2014 EclipseSource.',
                ' * All rights reserved.',
                ' */\n'].join('\n');

  var prefix = function( prefix, strings ) {
    return strings.map( function( string ) { return prefix + string; } );
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ["build"],
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'examples/**/*.js', '!**/lib/**/*.js']
    },
    jasmine: {
      options: {
        specs: 'test/js/*.spec.js',
        helpers: ['test/js/NativeBridgeSpy.js'],
        version: '2.0.0',
        display: 'short',
        summary: true
      },
      src: 'build/tabris.js'
    },
    concat: {
      options: {
        banner: banner,
        stripBanners: true
      },
      dist: {
        src: prefix( 'src/js/', [
                     'util.js',
                     'util-colors.js',
                     'util-fonts.js',
                     'util-images.js',
                     'Tabris.js',
                     'NativeBridge.js',
                     'Events.js',
                     'Animation.js',
                     'DOMEvents.js',
                     'WindowTimers.js',
                     'Device.js',
                     'Proxy.js',
                     'UIProxy.js',
                     'List.js',
                     'ScrollComposite.js',
                     'Page.js',
                     'Action.js',
                     'TabFolder.js',
                     'CanvasContext.js',
                     'LegacyCanvasContext.js',
                     'WebStorage.js',
                     'XMLHttpRequest.js'
                    ] ),
        dest: 'build/tabris.js'
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        src: 'build/tabris.js',
        dest: 'build/tabris.min.js'
      }
    },
    doc: {
      json: prefix('doc/definitions/', [
        'widgetProperties.json',
        'widgetEvents.json',
        'Action.json',
        'Button.json',
        'Canvas.json',
        'CheckBox.json',
        'Combo.json',
        'Composite.json',
        'ImageView.json',
        'Label.json',
        'List.json',
        'Page.json',
        'ProgressBar.json',
        'RadioButton.json',
        'Slider.json',
        'Tab.json',
        'TabFolder.json',
        'ToggleButton.json',
        'ScrollComposite.json',
        'Text.json',
        'WebView.json'
      ]),
      target: 'build/doc/widget-types.md'
    },
    copy: {
      doc: {
        expand: true,
        cwd: 'doc/',
        src: '*.md',
        dest: 'build/doc/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadTasks('doc/generator');

  grunt.registerTask('examples', 'Copy examples to build/, create index', function() {
    var aggregatedIndex = [];
    grunt.file.expand("examples/*").forEach(function(dir) {
      if (grunt.file.exists(dir, "index.json")) {
        var index = grunt.file.readJSON(path.join(dir, "/index.json"));
        if ("title" in index) {
          grunt.file.recurse(dir, function callback(abspath) {
            grunt.file.copy(abspath, path.join('build/', abspath));
          });
          aggregatedIndex.push({
            title: index.title,
            description: index.description || "",
            path: path.basename(dir)
          });
        }
      }
    });
    grunt.file.write('build/examples/index.json', JSON.stringify(aggregatedIndex, null, 2));
  });

  grunt.registerTask('default', ['clean', 'doc', 'copy:doc', 'jshint', 'concat', 'uglify', 'jasmine', 'examples']);

};
