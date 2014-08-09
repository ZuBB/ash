module.exports = function(grunt) {
    grunt.registerTask('rq-vars', function() {
        grunt.config.set('vars.buildType', 'release');
        grunt.config.set('vars.graphic_type', 0);

        if (grunt.file.exists('excludes_list.json')) {
            grunt.config('vars.excludesList',
                grunt.file.readJSON('excludes_list.json').excludesList);
        }
    });
};
