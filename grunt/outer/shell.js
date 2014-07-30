module.exports = function(grunt, options) {
    return {
        options: {
            stdout: false
        },
        // branch
        'git1': {
            command: 'git rev-parse --abbrev-ref HEAD',
            options: {
                callback: function(err, stdout, stderr, cb) {
                    grunt.config('vars.branch', stdout.trim());
                    cb();
                }
            }
        },
        // commits
        'git2': {
            command: 'git rev-list --count HEAD',
            options: {
                callback: function(err, stdout, stderr, cb) {
                    grunt.config('vars.changesets', stdout.trim());
                    cb();
                }
            }
        },
        // modified
        'git3': {
            command: 'git diff --stat',
            options: {
                callback: function(err, stdout, stderr, cb) {
                    grunt.config('vars.modified', stdout.trim().length > 0);
                    cb();
                }
            }
        },
        // version
        'git4': {
            command: 'git describe --abbrev=0 --tags',
            options: {
                callback: function(err, stdout, stderr, cb) {
                    grunt.config('vars.version', stdout.trim());
                    cb();
                }
            }
        }
    };
};

