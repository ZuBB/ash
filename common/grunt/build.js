module.exports = function(grunt) {
    var totalFileList = [
        'src/core/src/core/!(main).js',
        'src/core/src/core/dispatcher/*.js',

        'src/core/src/vendor/json/json2.js',
        'src/core/src/vendor/es5-shim/es5-shim.js',
        'src/core/src/vendor/i18next-static/i18next-1.7.3.js',
        'src/core/src/vendor/color-static/color-0.6.0.js',

        'src/core/src/extension/*.js',

        'src/core/src/lang/*.js',
        'src/lang/lang*.js',

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

        'src/core/src/vendor/json/json2.js',
        'src/core/src/vendor/es5-shim/es5-shim.js',

        'src/core/src/extension',

        'src/app/',
        'src/core/src/core/main.js',
    ];

    var featuresFilters = {
        basic: function(filepath, options) {
            if (options.lint && ~filepath.indexOf('vendor')) {
                return false;
            }

            return basicFileList.some(function(allowedFilename) {
                return ~filepath.indexOf(allowedFilename);
            });
        },
        colorlib: function(filepath, options) {
            return options.lint ? false : ~filepath.indexOf('vendor/color');
        },
        compare: function(filepath) {
            var file1 = ~filepath.indexOf('dispatcher-dump4compare.js');
            var file2 = ~filepath.indexOf('dispatcher-dump.js');

            return file1 || file2;
        },
        graphics: function(filepath) {
            return ~filepath.indexOf('dispatcher-graphics.js');
        },
        i18n: function(filepath, options) {
            if (options.lint) {
                return false;
            }

            var file1 = Boolean(~filepath.indexOf('src/lang'));
            var file2 = Boolean(~filepath.indexOf('i18next'));

            if (file1 && /init/.test(filepath)) return true;
            if (file1 && /-en/.test(filepath)) return true;
            if (options.loader) {
                if (file1 && /-[a-z]{2}\.iso/.test(filepath)) return true;
            } else {
                if (file1 && /-[a-z]{2}.js/.test(filepath)) return true;
            }
            if (file2) return true;
            return false;
        },
        tasks: function(filepath, options) {
            var excludesList = grunt.config('pkg.excludesList');

            if (~filepath.indexOf('src/tasks') === 0) {
                return false;
            }

            if (options.release === false) {
                return true;
            }

            if (!Array.isArray(excludesList) || excludesList.length < 1) {
                return true;
            }

            return !excludesList.some(function(allowedFilename) {
                return ~filepath.indexOf(allowedFilename);
            });
        },
        messages: function(filepath) {
            return ~filepath.indexOf('dispatcher-messages.js');
        },
        progress: function(filepath) {
            return ~filepath.indexOf('dispatcher-progress.js');
        },
        test: function(filepath) {
            var file1 = ~filepath.indexOf('dispatcher-dump4test.js');
            var file2 = ~filepath.indexOf('dispatcher-dump.js');

            return file1 || file2;
        }
    };

    return {
        'filesList': totalFileList,
        'filterFunction': function(filepath, options) {
            options = options || {};

            return grunt.config('pkg.requiredFeatures')
                .some(function(feature) {
                    return featuresFilters[feature](filepath, options);
                });
        }
    };
};
