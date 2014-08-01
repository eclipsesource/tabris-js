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
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'examples/**/*.js']
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
        src: prefix( 'src/js/',
                     ['util.js', 'util-colors.js',
                      'Tabris.js', 'Window.js', 'Console.js', 'Proxy.js', 'UIProxy.js', 'PageProxy.js'] ),
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'jasmine']);

};
