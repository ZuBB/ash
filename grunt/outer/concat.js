module.exports = {
    options: {
        nonull: true
        //banner: '(function () {  "use strict"; }());\n'
    },
    dev: {
        src: [
            'src/core/src/core/!(main).js',
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
            'src/core/src/runner/main.js',
        ],
        dest: '<%= vars.destFile %>'
    },
    jshint: {
        src: [
            'src/core/src/core/!(main).js',
            'src/core/src/extension/*.js',
            'src/core/src/lang/init*.js',
            'src/tasks/*.js',
            'src/app/*.js',
            'src/core/src/runner/main.js',
        ],
        dest: '<%= vars.destFile %>'
    }
};

