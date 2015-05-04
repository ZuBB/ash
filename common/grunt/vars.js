module.exports = function(grunt) {
    grunt.registerTask('vars-dev', function() {
        grunt.config.set('vars.graphic_type', 2);
    });

    grunt.registerTask('vars-rq', function() {
        grunt.config.set('vars.graphic_type', 0);
    });

    var allDestFilenames = [];

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
        'logLevel': 0,

        'getLastDestFile': function() {
            return allDestFilenames
                .filter(function(filepath) {
                    return grunt.file.exists(filepath);
                })
                .slice(-1).pop();
        },

        'getNewDestFile': function(currentTask) {
            var newFilename = [
                grunt.config('vars.dest'),
                grunt.config('vars.name').toLowerCase(),
                '.'+ currentTask.name + '.',
                grunt.config('vars.ext')
            ].join('');

            if (allDestFilenames.indexOf(newFilename) < 0) {
                allDestFilenames.push(newFilename);
            }

            return newFilename;
        }
    };
};

