module.exports = {
    main: {
        closurePath: '.',
        js: '<%= vars.getLastDestFile() %>',
        jsOutputFile: '<%= vars.getNewDestFile(grunt.task.current) %>',
        noreport: true,
        options: {
            //language_in: 'ECMASCRIPT5_STRICT',
            compilation_level: 'SIMPLE_OPTIMIZATIONS',
            externs: 'src/core/src/build/extern.js',
            debug: false
        }
    }
};
