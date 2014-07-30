module.exports = function(grunt) {
    grunt.registerTask('rq-vars', function() {
        grunt.config.set('vars.buildType', 'release');
        grunt.config.set('vars.graphic_type', 0);
    });
};
