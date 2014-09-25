// http://www.jshint.com/docs/options/
// http://jslinterrors.com/

module.exports = {
    options: {
        reporter: require('jshint-stylish'),
    },
    i18n: {
        src: [
            'src/core/src/lang/init-lang.js',
            'src/core/src/lang/lang-??.js',
            'src/lang/lang-??.js',
        ],

        options: {
            es3: true,
            latedef: false,
        }
    },
    light: {
        src: '<%= vars.destFile %>',

        options: {
            globals: {
                'ActiveXObject': false,
                'Enumerator': false,
                'Host': false
            },

            es3: true,
            nonbsp: true,
            undef: true,
            loopfunc: true,
            sub: true,
        }
    },
    core: {
        src: 'src/core/src/core/*js',
        options: {
            curly: true,
            eqeqeq: true,
            forin: true,

            indent: 4,
            maxdepth: 3,
            maxlen: 80,

            latedef: true,
            unused: true,
            multistr: true,
            passfail: false,
            loopfunc: false,
        }
    }
};
