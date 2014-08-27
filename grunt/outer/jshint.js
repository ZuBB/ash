// http://www.jshint.com/docs/options/
// http://jslinterrors.com/

module.exports = {
    options: {
        reporter: require('jshint-stylish'),

        globals: {
            'ActiveXObject': false,
            'Enumerator': false,
            'Host': false
        },

        es3: true,
        nonbsp: true,
        undef: true,
        loopfunc: true,
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
    },
    light: {
        src: '<%= vars.destFile %>'
    },
    moderate: {
        src: '<%= vars.destFile %>',
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

