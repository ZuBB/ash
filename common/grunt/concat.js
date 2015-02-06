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
                return grunt.config('build.filterFunction')(filepath);
            }
        }
    }
};
