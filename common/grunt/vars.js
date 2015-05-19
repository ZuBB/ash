module.exports = function(grunt) {
    grunt.registerTask('vars-dev', function() {
        grunt.config.set('vars.graphic_type', 2);
    });

    grunt.registerTask('vars-rq', function() {
        grunt.config.set('vars.graphic_type', 0);
    });


    return {
        'ext': 'ajs',
        'name': '<%= pkg.devFilename %>',
        'dest': 'build/output/',
        'buildType': null,

        'mail': {
            'to': '',
            'cc': '',
            'bcc': '',
            'from': 'ASH Build System',
            'subject': '',
            'message': '',
            'messageFooter': 'Email sent by ASH robat v3.',
            'smtpCredsFile': 'creds.smtp.json'
        },

        'hash': null,
        'branch': null,
        'modified': null,
        'changesets': null,

        'datatype': '$DATATYPE$',
        'demoMode': false,
        'graphic_type': null,
        'logLevel': 0
    };
};

