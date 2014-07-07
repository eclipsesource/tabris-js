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
        specs: prefix( 'test/js/',
                       ['util.spec.js', 'NativeBridgeSpy.spec.js', 'Tabris.spec.js',
                        'tabris-ui.spec.js', 'Proxy.spec.js', 'PageProxy.spec.js'] ),
        helpers: ['test/js/NativeBridgeSpy.js'],
        version: '2.0.0',
        display: 'short',
        summary: true
      },
      src: prefix( 'src/js/',
                   ['util.js', 'Tabris.js', 'tabris-ui.js', 'Proxy.js', 'PageProxy.js'] )
    },
    concat: {
      options: {
        banner: banner,
        stripBanners: true
      },
      dist: {
        src: prefix( 'src/js/',
                     ['util.js', 'Tabris.js', 'tabris-ui.js', 'Proxy.js', 'PageProxy.js'] ),
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

  grunt.registerTask('default', ['jshint', 'jasmine', 'concat', 'uglify']);

};
