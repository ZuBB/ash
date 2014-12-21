module.exports = function(grunt) {
    return {
        options: {
            nonull: true
            //banner: '(function () {  "use strict"; }());\n'
        },
        dev: {
            files: [{
                src: [
                    'src/core/src/core/!(main).js',
                    'src/core/src/core/input/input.js',
                    'src/core/src/core/input/field-generic.js',
                    'src/core/src/core/input/field-basic-dropdown.js',
                    'src/core/src/core/input/field-basic-string.js',
                    'src/core/src/core/input/field-extra-channel.js',
                    'src/core/src/core/input/field-extra-float.js',
                    'src/core/src/core/input/field-extra-integer.js',
                    'src/core/src/vendor/json/json2.js',
                    'src/core/src/vendor/es5-shim/es5-shim.js',
                    'src/core/src/vendor/i18next-static/i18next-1.7.3.js',
                    'src/core/src/vendor/color-static/color-0.6.0.js',
                    'src/core/src/extension/*.js',
                    'src/core/src/lang/init*.js',
                    'src/core/src/lang/lang-??.js',
                    'src/lang/lang-??.js',
                    'src/tasks/*.js',
                    'src/app/*.js',
                    'src/core/src/core/main.js',
                ],
                dest: '<%= vars.destFile %>',
                filter: function(filepath) {
                    var releaseType = grunt.config('vars.buildType');
                    var release = releaseType === 'release';

                    return release === false ? true :
                        !grunt.config('vars.excludesList')
                            .some(function(item) {
                                return filepath.indexOf(item) > -1;
                            });
                }
            }]
        },
        jshint: {
            src: [
                'src/core/src/core/!(main).js',
                'src/core/src/core/input/input.js',
                'src/core/src/core/input/field-generic.js',
                'src/core/src/core/input/field-basic-dropdown.js',
                'src/core/src/core/input/field-basic-string.js',
                'src/core/src/core/input/field-extra-channel.js',
                'src/core/src/core/input/field-extra-float.js',
                'src/core/src/core/input/field-extra-integer.js',
                'src/core/src/extension/*.js',
                'src/tasks/*.js',
                'src/app/*.js',
                'src/core/src/core/main.js',
            ],
            dest: '<%= vars.destFile %>'
        }
    }
};
