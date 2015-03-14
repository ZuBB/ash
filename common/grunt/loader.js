module.exports = function(grunt) {
    grunt.registerMultiTask('loader', function() {
        var name = grunt.config('pkg.devFilename') + '-quick.ajs';
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

    return {
        main: {
            options: {
                prefix: '\/\/include ',
            },
            files: [{
                expand: true,
                src: [
                    'src/core/src/core/!(main).js',
                    'src/core/src/vendor/json/json2.js',
                    'src/core/src/vendor/es5-shim/es5-shim.js',
                    'src/core/src/vendor/color-static/color-0.6.0.js',
                    'src/core/src/vendor/i18next-static/i18next-1.7.3.js',
                    'src/core/src/extension/*.js',
                    'src/core/src/lang/init-lang.js',
                    'src/core/src/lang/lang-en.js',
                    'src/core/src/lang/lang-ru.iso.js',
                    'src/lang/lang-en.js',
                    'src/lang/lang-ru.iso.js',
                    'src/app/*.js',
                    'src/tasks/*.js',
                    'src/core/src/core/main.js',
                ]
            }]
        }
    };
};


