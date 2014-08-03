module.exports = {
    options: {
        reporter: require('jshint-stylish')
    },
    main: {
        jshintrc: 'src/core/jshintrc',
        src: '<%= vars.destFile %>'
    }
};

