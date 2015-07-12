module.exports = function(grunt, options) {
    grunt.registerTask('mailer-transport', function() {
        var filename = grunt.option('smtpCredsFile') ||
            grunt.config('vars.mail.smtpCredsFile');

        if (grunt.file.exists(filename)) {
            grunt.config('nodemailer.options.transport',
                grunt.file.readJSON(filename));
        } else {
            grunt.fail.fatal('Can\'t find file with credentials for smtp');
        }
    });

    grunt.registerTask('mailer-common', function() {
        grunt.config('nodemailer.options.message.attachments',
            grunt.file.expand(grunt.config('vars.dest') + '/*')
                .filter(function(item) {
                    return /js$/.test(item) ? /cooked/.test(item) : true;
                })
                .map(function(item) {
                    return {'filePath': item};
                })
        );

        grunt.config('vars.mail.message', grunt.option('message') || '');

        var from = grunt.config('vars.mail.from');
        if (from && from.indexOf('@') < 0) {
            var key = 'nodemailer.options.transport.options.auth.user';
            from += ' ' + grunt.config(key)
            grunt.config('vars.mail.from', from);
        }
    });

    grunt.registerTask('mailer-uib', function() {
        grunt.config('vars.mail.subject',
                grunt.config('pkg.devFilename') + ': new developer build');

        grunt.task.run('uib', 'mailer-transport', 'mailer-common');
    });

    grunt.registerTask('mailer-rq', function() {
        grunt.config('vars.mail.subject',
                grunt.config('pkg.devFilename') + ': new build of release type');

        grunt.task.run('rqb', 'mailer-transport', 'mailer-common');
    });

    return {
        options: {
            message: {
                from:    '<%= vars.mail.from %>',
                to:      '<%= vars.mail.to %>',
                cc:      '<%= vars.mail.cc %>',
                bcc:     '<%= vars.mail.bcc %>',
                subject: '<%= vars.mail.subject %>',
                text:    '<%= vars.mail.message %>\n\n' +
                    '<%= vars.mail.messageFooter %>'
            }
        },
        send: {}
    };
};

