module.exports = function(grunt) {

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
        specs: ['test/js/util.spec.js', 'test/js/tabris.spec.js', 'test/js/tabris-ui.spec.js'],
        helpers: ['test/js/NativeBridgeSpy.js'],
        version: '2.0.0',
        display: 'short',
        summary: true
      },
      src: ['src/js/util.js', 'src/js/tabris.js', 'src/js/tabris-ui.js']
    },
    concat: {
      options: {
        banner: '/*! tabris.js <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        stripBanners: true
      },
      dist: {
        src: ['src/js/util.js', 'src/js/tabris.js', 'src/js/tabris-ui.js'],
        dest: 'build/tabris.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! tabris.js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
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
