module.exports = function(grunt, options) {
    // https://github.com/nuzzio/grunt-strip-code/pull/3
    // https://github.com/nuzzio/grunt-strip-code/issues/4
    grunt.registerTask('strip', function() {
        var filepath = grunt.config('vars.destFile');
        var content = grunt.file.read(filepath);
        var startCount = content.match(/^\s*\/\/DEBUG_START/gm).length;
        var endCount = content.match(/^\s*\/\/DEBUG_STOP/gm).length;

        if (startCount !== endCount) {
            grunt.fail.fatal('File contains different amount of ' +
                'DEBUG_START/DEBUG_STOP pairs');
        }

        if (/\/\/DEBUG_START[^\/DEBUG_STOP]+\/\/DEBUG_START/gm.test(content)) {
            grunt.fail.fatal('DEBUG_START/DEBUG_STOP pairs are intersecting');
        }

        content = content.replace(
                /^\s*\/\/DEBUG_START[\S\s]*?\/\/DEBUG_STOP/gm, '');

        grunt.file.delete(filepath);
        grunt.file.write(filepath, content);

        // https://github.com/chrisdanford/grunt-lint-pattern/pull/2
        if (/\b_(d|i|p|w|e|f)\(/gm.test(content)) {
            grunt.fail.fatal('Stripped file still has debug functions in it');
            grunt.log.writeln(RegExp.lastMatch);
            return false;
        }
    });
};
