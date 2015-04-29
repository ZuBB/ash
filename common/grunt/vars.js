module.exports = function(grunt) {
    grunt.registerTask('dev-vars', function() {
        grunt.config.set('vars.buildType', 'dev');
        grunt.config.set('vars.graphic_type', 2);
        grunt.config.set('vars.name', grunt.config('pkg.devFilename'));
    });

    grunt.registerTask('rq-vars', function() {
        grunt.config.set('vars.buildType', 'release');
        grunt.config.set('vars.graphic_type', 0);
        grunt.config.set('vars.name', grunt.config('pkg.releaseFilename') ||
            grunt.config('pkg.devFilename'));
    });

    grunt.registerTask('test-vars', function() {
        //grunt.config.set('vars.createGraphics', false);
        grunt.config.set('vars.logLevel', 1);
    });

    var allDestFilenames = [];

    return {
        'ext': 'ajs',
        'name': '',
        'dest': 'build/output/',
        'buildType': null,

        'destFile': [
            '<%= vars.dest %>',
            '<%= vars.name.toLowerCase() %>.',
            '<%= vars.buildType %>.',
            '<%= vars.ext %>'
        ].join(''),

        'mail': {
            'to': '',
            'cc': '',
            'bcc': '',
            'from': 'ASH Build System',
            'subject': '',
            'message': '',
            'messageFooter': 'Email sent by ASH robat v2.',
            'smtpCredsFile': 'creds.smtp.json'
        },

        'hash': null,
        'branch': null,
        'modified': null,
        'changesets': null,

        'datatype': '$DATATYPE$',
        'demo_mode': false,
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


