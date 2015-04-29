module.exports = function(grunt) {
    return {
        options: {
            nonull: true
            //banner: '(function () {  "use strict"; }());\n'
        },
        single: {
            src: '<%= build.filesList %>',
            dest: '<%= vars.getNewDestFile(grunt.task.current) %>',
            filter: function(filepath) {
                var currEnv = grunt.config.get('environment.env');
                var options = {
                    'release': currEnv === 'rqb',
                    'lint': currEnv === 'lint'
                };

                return grunt.config('build.filterFunction')(filepath, options);
            }
        }
    }
};
