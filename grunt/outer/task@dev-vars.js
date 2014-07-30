module.exports = function(grunt) {
    grunt.registerTask('dev-vars', function() {
        grunt.config.set('vars.buildType', 'dev');
        grunt.config.set('vars.graphic_type', 2);
        grunt.config.set('vars.ext', 'ajs');
    });
};

