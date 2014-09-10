module.exports = function(grunt) {
    grunt.registerMultiTask('loader', function() {
        var name = grunt.config('pkg.name') + '-quick.ajs';
        var prefix = this.options().prefix;
        var content = this.files
        .map(function(item) {
            return prefix + '"' + item.src + '"\n';
        })
        .reduce(function(dst, src) {
            return dst + src;
        }, '');

        grunt.file.write(name, grunt.util.normalizelf(content));
    });
};
