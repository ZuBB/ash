module.exports = {
    main: {
        closurePath: '.',
        js: '<%= vars.destFile %>',
        // cant write to same file, have to go with workaround
        jsOutputFile: '<%= vars.destFile %>1',
        noreport: true,
        options: {
            //language_in: 'ECMASCRIPT5_STRICT',
            compilation_level: 'SIMPLE_OPTIMIZATIONS',
            externs: 'src/core/src/build/extern.js',
            debug: false
        }
    }
};
