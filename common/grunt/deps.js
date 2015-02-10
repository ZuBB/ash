module.exports = function(grunt) {
    taskDescription = 'Custom task to update common version of ' +
        '\'package.json\' file';
    grunt.registerTask('setDeps', taskDescription, function() {
        grunt.task.run('copy:config2common');
    });

    taskDescription = 'Custom task to update local version of ' +
        '\'package.json\' file';
    grunt.registerTask('getDeps', taskDescription, function() {
        grunt.task.run('copy:config2local', 'shell:npm_deps');
    });
};

