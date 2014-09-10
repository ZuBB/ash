module.exports = function(grunt) {
    grunt.registerTask('dev-vars', function() {
        grunt.config.set('vars.buildType', 'dev');
        grunt.config.set('vars.graphic_type', 2);
        grunt.config.set('vars.name', grunt.config('pkg.name'));
        grunt.config.set('vars.ext', 'ajs');
    });

    grunt.registerTask('rq-vars', function() {
        grunt.config.set('vars.buildType', 'release');
        grunt.config.set('vars.graphic_type', 0);
        grunt.config.set('vars.name', grunt.config('pkg.title').toLowerCase());

        if (grunt.file.exists('excludes_list.json')) {
            grunt.config('vars.excludesList',
                grunt.file.readJSON('excludes_list.json').excludesList);
        }
    });
};
