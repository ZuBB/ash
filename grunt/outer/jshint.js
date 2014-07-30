module.exports = {
    options: {
        reporter: require('jshint-stylish')
    },
    main: {
        jshintrc: 'build/sdh/jshintrc',
        src: '<%= vars.destFile %>'
    }
};

