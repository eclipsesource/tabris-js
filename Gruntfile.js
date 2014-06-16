module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },
    concat: {
      options: {
        banner: '/*! tabris.js <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        stripBanners: true
      },
      dist: {
        src: ['src/js/tabris.js'],
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
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
