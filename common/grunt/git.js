module.exports = function(grunt, options) {
    return {
        branch: {
            options: {
                simple: {
                    cmd: 'rev-parse',
                    args: ['--abbrev-ref', 'HEAD'],
                    onComplete: function(err, stdout, callback) {
                        grunt.config.set('vars.branch', stdout.trim());
                        callback();
                    }
                }
            }
        },
        commits: {
            options: {
                simple: {
                    cmd: 'rev-list',
                    args: ['--count', 'HEAD'],
                    onComplete: function(err, stdout, callback) {
                        grunt.config.set('vars.changesets', stdout.trim());
                        callback();
                    }
                }
            }
        },
        sha: {
            options: {
                simple: {
                    cmd: 'rev-parse',
                    args: ['--short', 'HEAD'],
                    onComplete: function(err, stdout, callback) {
                        grunt.config.set('vars.hash', stdout.trim());
                        callback();
                    }
                }
            }
        },
        modified: {
            options: {
                simple: {
                    cmd: 'diff',
                    args: ['--stat'],
                    onComplete: function(err, stdout, callback) {
                        var sign = stdout.trim().length > 0 ? '+' : '';
                        grunt.config.set('vars.modified', sign);
                        callback();
                    }
                }
            }
        }
    };
};
