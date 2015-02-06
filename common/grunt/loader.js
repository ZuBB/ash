module.exports = {
    main: {
        options: {
            prefix: '\/\/include ',
        },
        files: [{
            expand: true,
            src: '<%= build.filesList %>'
        }]
    }
};
