module.exports = function(grunt) {
    return {
        options: {
            nonull: true
            //banner: '(function () {  "use strict"; }());\n'
        },
        dev: {
            src: '<%= build.filesList %>',
            dest: '<%= vars.destFile %>',
            filter: function(filepath) {
                var isRelease = grunt.config('vars.buildType') === 'release';
                return grunt.config('build.filterFunction')(filepath,
                        {'release': isRelease });
            }
        },
        jshint: {
            src: '<%= build.filesList %>',
            dest: '<%= vars.destFile %>',
            filter: function(filepath) {
                var options = {'lint': true};
                return grunt.config('build.filterFunction')(filepath, options);
            }
        }
    }
};
