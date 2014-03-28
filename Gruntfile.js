module.exports = function(grunt) {

  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-peg');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
      peg: {
	  grammar: {
	      src: "grammar.pegjs",
	      dest: "grammar.js"
	  },
	  ruleGrammar: {
	      src: "ruleGrammar.pegjs",
	      dest: "ruleGrammar.js"
	  }
      },
      // Configure a mochaTest task
      mochaTest: {
	  test: {
              options: {
		  reporter: 'spec'
              },
              src: ['test/**/*.js']
	  }
      },
      watch: {
	  js: {
              files: '**/*.js',
              tasks: ['default']
	  }
      }
  });

  grunt.registerTask('default', ['peg', 'mochaTest']);

};

