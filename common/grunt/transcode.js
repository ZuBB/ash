module.exports = {
    options: {
        fromEncoding: 'utf8',
        toEncoding: 'cp1251'
    },
    i18n: {
        files: [
            {
                src: 'src/core/src/lang/lang-ru.js',
                dest: 'src/core/src/lang/lang-ru.iso.js',
            },
            {
                src: 'src/lang/lang-ru.js',
                dest: 'src/lang/lang-ru.iso.js',
            }
        ]
    },
    main: {
        src: '<%= vars.destFile %>',
        dest: '<%= vars.destFile %>',
    }
};
