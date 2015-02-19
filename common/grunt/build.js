module.exports = function(grunt) {
    var totalFileList = [
        'src/core/src/core/!(main).js',
        'src/core/src/core/dispatcher/*.js',

        'src/core/src/vendor/json/json2.js',
        'src/core/src/vendor/es5-shim/es5-shim.js',
        'src/core/src/vendor/i18next-static/i18next-1.7.3.js',
        'src/core/src/vendor/color-static/color-0.6.0.js',

        'src/core/src/extension/*.js',

        'src/core/src/lang/init*.js',
        'src/core/src/lang/lang-??.js',
        'src/lang/lang-??.js',

        'src/app/*.js',
        'src/tasks/*.js',

        'src/core/src/core/main.js',
    ];

    var basicFileList = [
        'definitions.js',
        'input.js',
        'io.js',
        'logger.js',
        'main.js',
        'profiler.js',
        'reporter.js',
        'task.js',
        'utils.js',

        'dispatcher-core.js',
        'dispatcher-messages.js',

        'src/core/src/vendor/json/json2.js',
        'src/core/src/vendor/es5-shim/es5-shim.js',

        'src/core/src/extension',

        'src/app/',
        'src/core/src/core/main.js',
    ];

    var featuresFilters = {
        basic: function(filepath) {
            return basicFileList.some(function(allowedFilename) {
                return ~filepath.indexOf(allowedFilename);
            });
        },
        colorlib: function(filepath) {
            return ~filepath.indexOf('vendor/color');
        },
        compare: function(filepath) {
            var file1 = ~filepath.indexOf('dispatcher-dump4compare.js');
            var file2 = ~filepath.indexOf('dispatcher-dump.js');

            return Boolean(file1 || file2);
        },
        graphics: function(filepath) {
            return ~filepath.indexOf('dispatcher-graphics.js');
        },
        i18n: function(filepath) {
            var file1 = ~filepath.indexOf('src/lang');
            var file2 = ~filepath.indexOf('i18next');

            return Boolean(file1 || file2);
        },
        tasks: function(filepath) {
            var releaseType = grunt.config('vars.buildType');
            var excludesList = grunt.config('pkg.excludesList');

            if (~filepath.indexOf('src\/tasks') === 0) {
                return false;
            }

            if (releaseType !== 'release' || excludesList < 1) {
                return true;
            }

            return !excludesList.some(function(allowedFilename) {
                return ~filepath.indexOf(allowedFilename);
            });
        /*},
        jshint: function(filepath) {
            return
                filepath.indexOf('vendor') < 0 &&
                filepath.indexOf('lang') < 0;*/
        },
        test: function(filepath) {
            var file1 = ~filepath.indexOf('dispatcher-dump4test.js');
            var file2 = ~filepath.indexOf('dispatcher-dump.js');

            return Boolean(file1 || file2);
        }
    };

    return {
        'filesList': totalFileList,
        'featuresFilters': featuresFilters,
        'filterFunction': function(filepath) {
            return grunt.config('pkg.requiredFeatures')
                .some(function(feature) {
                    return featuresFilters[feature](filepath);
                });
        }
    };
};
