module.exports = function(grunt) {
    return {
        options: {
            nonull: true
            //banner: '(function () {  "use strict"; }());\n'
        },
        single: {
            src: '<%= build.filesList %>',
            dest: '<%= prev_file.script.getNewDestFile(grunt.task.current) %>',
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
