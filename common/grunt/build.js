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

        'src/core/src/extension/*.js',

        'src/app/*.js',
        'src/core/src/core/main.js',
    ];

    var featuresFilters = {
        basic: function(filepath) {
            return basicFileList.some(function(allowedFilename) {
                return ~filepath.indexOf(allowedFilename);
            });
        },
        colorlib: function() {
            return ~filepath.indexOf('vendor/color');
        },
        i18n: function() {
            return
                ~filepath.indexOf('src/lang') ||
                ~filepath.indexOf('i18next');
        },
        compare: function(filepath) {
            return
                ~filepath.indexOf('dispatcher-dump4compare.js') ||
                ~filepath.indexOf('dispatcher-dump.js');
        },
        dump: function(filepath) {
            return
                ~filepath.indexOf('dispatcher-dump4test.js') ||
                ~filepath.indexOf('dispatcher-dump.js');
        },
        graphics: function(filepath) {
            return ~filepath.indexOf('dispatcher-graphics.js');
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

            return excludesList.indexOf(filepath) < 0;
        },
        jshint: function(filepath) {
            return
                filepath.indexOf('vendor') < 0 &&
                filepath.indexOf('lang') < 0;
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
