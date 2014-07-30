module.exports = {
    i18n: {
        files: '**\/lang-ru.js',
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

