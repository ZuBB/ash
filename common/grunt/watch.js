module.exports = {
    'i18n-jshint': {
        files: [
            'src/core/src/lang/init-lang.js',
            'src/core/src/lang/lang-??.js',
            'src/lang/lang-??.js',
        ],
        tasks: ['jshint:i18n'],
        options: {
            atBegin: true,
            event: ['changed']
        }
    },
    'i18n-transcode': {
        files: ['src/core/src/lang/lang-ru.js', 'src/lang/lang-ru.js'],
        tasks: ['transcode:i18n'],
        options: {
            atBegin: true,
            event: ['changed']
        }
    },
    specs: {
        files: 'src/tasks/*',
        tasks: ['loader:main'],
        options: {
            atBegin: true,
            event: ['added', 'deleted']
        }
    }
};
