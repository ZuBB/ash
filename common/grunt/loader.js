module.exports = function(grunt) {
    grunt.registerMultiTask('loader', function() {
        var name = grunt.config('pkg.devFilename') + '-quick.ajs';
        var prefix = this.options().prefix;
        var content = this.files
            .reduce(function(dst, item) {
                return dst + prefix + '"' + item.src + '"\n';
            }, '');

        grunt.file.write(name, grunt.util.normalizelf(content));
    });

    return {
        main: {
            options: {
                prefix: '\/\/include ',
            },
            files: [{
                expand: true,
                src: '<%= build.filesList %>',
                filter: function(filepath) {
                    return grunt.config('build.filterFunction')(filepath,
                            {'loader': true});
                }
            }]
        }
    };
};

