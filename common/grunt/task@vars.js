module.exports = function(grunt) {
    grunt.registerTask('dev-vars', function() {
        grunt.config.set('vars.buildType', 'dev');
        grunt.config.set('vars.graphic_type', 2);
        grunt.config.set('vars.name', grunt.config('pkg.devFilename'));
    });

    grunt.registerTask('rq-vars', function() {
        grunt.config.set('vars.buildType', 'release');
        grunt.config.set('vars.graphic_type', 0);
        grunt.config.set('vars.name', grunt.config('pkg.releaseFilename') ||
            grunt.config('pkg.devFilename'));

        grunt.config('vars.excludesList',
                grunt.config('pkg.excludesList') || []);
    });

    grunt.registerTask('test-vars', function() {
        //grunt.config.set('vars.createGraphics', false);
        grunt.config.set('vars.logLevel', 1);
    });
};
