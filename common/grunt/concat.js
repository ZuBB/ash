module.exports = function(grunt) {
    return {
        options: {
            nonull: true
            //banner: '(function () {  "use strict"; }());\n'
        },
        single: {
            src: '<%= build.filesList %>',
            dest: '<%= prev_file.getNewDestFile() %>',
            filter: function(filepath) {
                var currEnv = grunt.config.get('environment.env');
                var platform = grunt.config.get('vars.platform');
                var options = {
                    'release': currEnv === 'rqb',
                    'lint': currEnv === 'lint',
                    'platform': platform
                };

                return grunt.config('build.filterFunction')(filepath, options);
            }
        }
    }
};
